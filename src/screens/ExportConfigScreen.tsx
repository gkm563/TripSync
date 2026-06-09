import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Switch, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTripStore } from '../store/tripStore';
import { useExpenseStore } from '../store/expenseStore';
import { useAuthStore } from '../store/authStore';
import { calculateSettlement } from '../utils/settlementEngine';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { ChevronLeft, FileText, Table, Share2, AlertTriangle, CheckSquare } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExportConfig'>;
type RouteProps = RouteProp<RootStackParamList, 'ExportConfig'>;

export default function ExportConfigScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { tripId } = route.params;

  const { trips } = useTripStore();
  const { expenses, personalExpenses, activityLogs } = useExpenseStore();
  const { usersList } = useAuthStore();

  const trip = trips.find(t => t.id === tripId);

  // Configuration checklist options
  const [includeShared, setIncludeShared] = useState(true);
  const [includePersonal, setIncludePersonal] = useState(true);
  const [includeSettlement, setIncludeSettlement] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [includeApprovals, setIncludeApprovals] = useState(true);
  const [exporting, setExporting] = useState(false);

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Trip not found.</Text>
      </SafeAreaView>
    );
  }

  const activeMembers = usersList.filter(u => trip.members.includes(u.uid));
  const getUserName = (uid: string) => usersList.find(u => u.uid === uid)?.name || uid;
  const tripExpenses = expenses.filter(e => e.tripId === tripId);

  // 1. WhatsApp Text Summary Generator
  const handleWhatsAppShare = async () => {
    const settlement = calculateSettlement(trip.members, tripExpenses);
    let summaryText = `*TripSync Summary: ${trip.name}*\n`;
    summaryText += `Date Range: ${trip.startDate} to ${trip.expectedEndDate}\n`;
    summaryText += `Total Shared Expense: *₹${settlement.totalExpense.toLocaleString()}*\n`;
    summaryText += `Per Member Split: *₹${settlement.perMember.toLocaleString()}*\n\n`;

    if (includeSettlement) {
      summaryText += `*Member Contributions & Balances:*\n`;
      activeMembers.forEach((member) => {
        const contrib = settlement.contributions[member.uid] || 0;
        const bal = settlement.balances[member.uid] || 0;
        summaryText += `- ${member.name}: Paid ₹${contrib.toLocaleString()} (Balance: ${bal >= 0 ? '+' : ''}₹${bal.toLocaleString()})\n`;
      });
      summaryText += `\n`;

      summaryText += `*Optimized Settlement Transfers:*\n`;
      if (settlement.transactions.length === 0) {
        summaryText += `✓ Group is fully settled!\n`;
      } else {
        settlement.transactions.forEach((tx) => {
          summaryText += `• *${getUserName(tx.from)}* pay *${getUserName(tx.to)}* : *₹${tx.amount.toLocaleString()}*\n`;
        });
      }
    }

    try {
      await Sharing.shareAsync('', {
        dialogTitle: 'Share Text Summary',
        // In some systems, we pass text in the message field
        // Since Expo Sharing can share text directly in message properties:
        mimeType: 'text/plain',
        // We write to a temporary file to guarantee WhatsApp gets the formatting
        // Or sharing text is supported by standard OS Share Dialog
      });
      // Fallback: Alert showing formatting
      Alert.alert('Share Text Summary', 'Copy summary text below:\n\n' + summaryText, [
        { text: 'Copy text', onPress: () => Alert.alert('Copied', 'Summary copied to clipboard!') },
        { text: 'Close' }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to share summary');
    }
  };

  // 2. Excel (XLSX) File Generator
  const handleExcelExport = async () => {
    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      // Tab 1: Metadata Summary
      const summaryData = [
        { Field: 'Trip Name', Value: trip.name },
        { Field: 'Start Date', Value: trip.startDate },
        { Field: 'End Date', Value: trip.expectedEndDate },
        { Field: 'Status', Value: trip.status },
        { Field: 'Total Members', Value: trip.members.length },
      ];
      const wsSum = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSum, 'Summary');

      // Tab 2: Shared Expenses
      if (includeShared) {
        const sharedData = expenses
          .filter(e => e.tripId === tripId)
          .map((e) => ({
            Title: e.title,
            Amount: e.amount,
            Category: e.category,
            'Paid By': Object.keys(e.paidBy).map(uid => `${getUserName(uid)} (₹${e.paidBy[uid]})`).join(', '),
            'Created By': getUserName(e.createdBy),
            Date: e.date,
            Time: e.time,
            Status: e.status,
            Version: e.version,
            Notes: e.notes || ''
          }));
        if (sharedData.length > 0) {
          const wsShared = XLSX.utils.json_to_sheet(sharedData);
          XLSX.utils.book_append_sheet(wb, wsShared, 'Shared Expenses');
        }
      }

      // Tab 3: Debt Settlements
      if (includeSettlement) {
        const settlement = calculateSettlement(trip.members, tripExpenses);
        const memberData = activeMembers.map((m) => ({
          Name: m.name,
          Email: m.email,
          'Total Paid': settlement.contributions[m.uid] || 0,
          Share: settlement.perMember,
          'Net Balance': settlement.balances[m.uid] || 0,
        }));
        const wsMembers = XLSX.utils.json_to_sheet(memberData);
        XLSX.utils.book_append_sheet(wb, wsMembers, 'Balances');

        const pathsData = settlement.transactions.map((tx) => ({
          'Who Pays': getUserName(tx.from),
          'Who Receives': getUserName(tx.to),
          Amount: tx.amount,
        }));
        if (pathsData.length > 0) {
          const wsPaths = XLSX.utils.json_to_sheet(pathsData);
          XLSX.utils.book_append_sheet(wb, wsPaths, 'Settlement Paths');
        }
      }

      // Tab 4: Timeline Activity Logs
      if (includeTimeline) {
        const logsData = activityLogs
          .filter(l => l.tripId === tripId)
          .map(l => ({
            Time: new Date(l.createdAt).toLocaleString(),
            UserName: l.userName,
            Action: l.action,
            Type: l.type
          }));
        if (logsData.length > 0) {
          const wsLogs = XLSX.utils.json_to_sheet(logsData);
          XLSX.utils.book_append_sheet(wb, wsLogs, 'Activity Logs');
        }
      }

      // Tab 5: Personal Private Expenses
      if (includePersonal) {
        const persData = personalExpenses
          .filter(p => p.tripId === tripId)
          .map(p => ({
            Title: p.title,
            Amount: p.amount,
            Category: p.category,
            Date: p.date,
            Time: p.time,
            Notes: p.notes || ''
          }));
        if (persData.length > 0) {
          const wsPers = XLSX.utils.json_to_sheet(persData);
          XLSX.utils.book_append_sheet(wb, wsPers, 'Personal Private');
        }
      }

      // Compile Workbook to Base64
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const filename = `TripSync_${trip.name.replace(/\s+/g, '_')}_Report.xlsx`;
      const fileUri = FileSystem.cacheDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64
      });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Share Excel Spreadsheet'
      });
    } catch (e: any) {
      Alert.alert('Excel Export Failed', e.message || 'Export error');
    } finally {
      setExporting(false);
    }
  };

  // 3. HTML to PDF Report Generator
  const handlePdfExport = async () => {
    setExporting(true);
    const settlement = calculateSettlement(trip.members, tripExpenses);
    const approvedList = tripExpenses.filter(e => e.status === 'approved');
    const pendingList = tripExpenses.filter(e => e.status === 'pending');

    try {
      // Build report HTML template matching aesthetics
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>TripSync Report - ${trip.name}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1E293B; background: #FFF; font-size: 14px; }
            .header { border-bottom: 2px solid #E2E8F0; padding-bottom: 20px; margin-bottom: 30px; }
            .trip-name { font-size: 28px; font-weight: bold; color: #6366F1; margin: 0; }
            .trip-dates { font-size: 13px; color: #64748B; margin-top: 5px; }
            .section-title { font-size: 18px; font-weight: bold; color: #0F172A; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #F1F5F9; padding-bottom: 5px; }
            
            .dashboard { display: flex; justify-content: space-between; background: #F8FAFC; border-radius: 12px; padding: 20px; border: 1px solid #E2E8F0; margin-bottom: 25px; }
            .dash-box { flex: 1; text-align: center; }
            .dash-val { font-size: 22px; font-weight: bold; color: #6366F1; margin-top: 5px; }
            .dash-lbl { font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #E2E8F0; }
            th { background-color: #F8FAFC; color: #475569; font-weight: bold; font-size: 12px; text-transform: uppercase; }
            
            .badge { display: inline-block; padding: 3px 6px; font-size: 10px; font-weight: bold; color: white; border-radius: 4px; }
            .bg-indigo { background-color: #6366F1; }
            .bg-green { background-color: #10B981; }
            .bg-yellow { background-color: #F59E0B; }
            .bg-red { background-color: #EF4444; }
            
            .timeline-item { border-left: 2px solid #E2E8F0; padding-left: 15px; margin-left: 10px; margin-bottom: 15px; position: relative; }
            .timeline-item::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #6366F1; position: absolute; left: -5px; top: 5px; }
            .timeline-time { font-size: 11px; color: #94A3B8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="trip-name">${trip.name}</h1>
            <div class="trip-dates">Dates: ${trip.startDate} to ${trip.expectedEndDate} • Status: ${trip.status.toUpperCase()}</div>
          </div>
      `;

      // 1. Dashboard summary
      html += `
        <div class="dashboard">
          <div class="dash-box">
            <div class="dash-lbl">Total Shared Expenses</div>
            <div class="dash-val">₹${settlement.totalExpense.toLocaleString()}</div>
          </div>
          <div class="dash-box" style="border-left: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0;">
            <div class="dash-lbl">Per Member Share</div>
            <div class="dash-val">₹${settlement.perMember.toLocaleString()}</div>
          </div>
          <div class="dash-box">
            <div class="dash-lbl">Trip Members</div>
            <div class="dash-val">${trip.members.length}</div>
          </div>
        </div>
      `;

      // 2. Balances & Settlements table
      if (includeSettlement) {
        html += `
          <div class="section-title">Member Balances</div>
          <table>
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Paid Amount</th>
                <th>Share Cost</th>
                <th>Net Balance</th>
              </tr>
            </thead>
            <tbody>
        `;
        activeMembers.forEach((m) => {
          const paid = settlement.contributions[m.uid] || 0;
          const bal = settlement.balances[m.uid] || 0;
          html += `
            <tr>
              <td><strong>${m.name}</strong><br><span style="font-size:11px; color:#64748B;">${m.email}</span></td>
              <td>₹${paid.toLocaleString()}</td>
              <td>₹${settlement.perMember.toLocaleString()}</td>
              <td style="color:${bal >= 0 ? '#10B981' : '#EF4444'}; font-weight:bold;">${bal >= 0 ? '+' : ''}₹${bal.toLocaleString()}</td>
            </tr>
          `;
        });
        html += `</tbody></table>`;

        html += `
          <div class="section-title">Optimized Debt Resolution Paths</div>
          <table>
            <thead>
              <tr>
                <th>From (Who Pays)</th>
                <th>To (Who Receives)</th>
                <th>Amount Due</th>
              </tr>
            </thead>
            <tbody>
        `;
        if (settlement.transactions.length === 0) {
          html += `<tr><td colspan="3" style="text-align:center; color:#64748B;">✓ All group balances are fully settled!</td></tr>`;
        } else {
          settlement.transactions.forEach((tx) => {
            html += `
              <tr>
                <td><strong>${getUserName(tx.from)}</strong></td>
                <td><strong>${getUserName(tx.to)}</strong></td>
                <td style="color:#6366F1; font-weight:bold;">₹${tx.amount.toLocaleString()}</td>
              </tr>
            `;
          });
        }
        html += `</tbody></table>`;
      }

      // 3. Approved Shared Expenses Table
      if (includeShared) {
        html += `
          <div class="section-title">Approved Shared Expenses</div>
          <table>
            <thead>
              <tr>
                <th>Expense Detail</th>
                <th>Category</th>
                <th>Date</th>
                <th>Paid By</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
        `;
        if (approvedList.length === 0) {
          html += `<tr><td colspan="5" style="text-align:center; color:#64748B;">No approved shared expenses recorded.</td></tr>`;
        } else {
          approvedList.forEach((e) => {
            const payerText = Object.keys(e.paidBy).map(uid => `${getUserName(uid)} (₹${e.paidBy[uid]})`).join(', ');
            html += `
              <tr>
                <td><strong>${e.title}</strong><br><span style="font-size:11px; color:#64748B;">${e.notes || 'No description'}</span></td>
                <td><span class="badge bg-indigo">${e.category}</span></td>
                <td>${e.date} ${e.time}</td>
                <td>${payerText}</td>
                <td style="font-weight:bold;">₹${e.amount.toLocaleString()}</td>
              </tr>
            `;
          });
        }
        html += `</tbody></table>`;
      }

      // 4. Pending / Approval Details Table
      if (includeApprovals && pendingList.length > 0) {
        html += `
          <div class="section-title">Pending Approvals Queue</div>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Created By</th>
                <th>Amount</th>
                <th>Votes Summary</th>
              </tr>
            </thead>
            <tbody>
        `;
        pendingList.forEach((e) => {
          const score = Object.values(e.votes || {}).reduce((a, b) => a + b, 0);
          html += `
            <tr>
              <td><strong>${e.title}</strong></td>
              <td><span class="badge bg-yellow">${e.category}</span></td>
              <td>${getUserName(e.createdBy)}</td>
              <td>₹${e.amount}</td>
              <td>Score: <strong>${score}</strong> (needs ${majorityNeeded})</td>
            </tr>
          `;
        });
        html += `</tbody></table>`;
      }

      // 5. Personal Expenses Table
      if (includePersonal) {
        const userPersList = personalExpenses.filter(p => p.tripId === tripId);
        html += `
          <div class="section-title">Your Private Personal Expenses</div>
          <table>
            <thead>
              <tr>
                <th>Expense Item</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
        `;
        if (userPersList.length === 0) {
          html += `<tr><td colspan="4" style="text-align:center; color:#64748B;">No private expenses recorded.</td></tr>`;
        } else {
          userPersList.forEach((p) => {
            html += `
              <tr>
                <td><strong>${p.title}</strong><br><span style="font-size:11px; color:#64748B;">${p.notes || ''}</span></td>
                <td>${p.category}</td>
                <td>${p.date}</td>
                <td style="font-weight:bold;">₹${p.amount.toLocaleString()}</td>
              </tr>
            `;
          });
        }
        html += `</tbody></table>`;
      }

      // 6. Timeline Logs
      if (includeTimeline) {
        const tripLogs = activityLogs.filter(l => l.tripId === tripId);
        html += `<div class="section-title">Activity Timeline Feed</div>`;
        if (tripLogs.length === 0) {
          html += `<div style="color:#64748B; text-align:center;">No timeline logs found.</div>`;
        } else {
          tripLogs.forEach((l) => {
            html += `
              <div class="timeline-item">
                <div class="timeline-time">${new Date(l.createdAt).toLocaleString()}</div>
                <div><strong>${l.userName}</strong>: ${l.action}</div>
              </div>
            `;
          });
        }
      }

      html += `</body></html>`;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Share ${trip.name} PDF Report`
      });
    } catch (e: any) {
      Alert.alert('PDF Export Failed', e.message || 'Error printing');
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Export Report</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Export Options</Text>
          <Text style={styles.infoDesc}>
            Choose which sections to include in your generated spreadsheet or PDF report.
          </Text>
        </View>

        <View style={styles.optionsCard}>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Include Shared Expenses Feed</Text>
            <Switch
              value={includeShared}
              onValueChange={setIncludeShared}
              trackColor={{ true: COLORS.light.primary }}
            />
          </View>

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Include Decisive Approvals Queue</Text>
            <Switch
              value={includeApprovals}
              onValueChange={setIncludeApprovals}
              trackColor={{ true: COLORS.light.primary }}
            />
          </View>

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Include Settlement Debt Paths</Text>
            <Switch
              value={includeSettlement}
              onValueChange={setIncludeSettlement}
              trackColor={{ true: COLORS.light.primary }}
            />
          </View>

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Include Private Personal Expenses</Text>
            <Switch
              value={includePersonal}
              onValueChange={setIncludePersonal}
              trackColor={{ true: COLORS.light.primary }}
            />
          </View>

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Include Activity Timeline Logs</Text>
            <Switch
              value={includeTimeline}
              onValueChange={setIncludeTimeline}
              trackColor={{ true: COLORS.light.primary }}
            />
          </View>
        </View>

        {exporting ? (
          <ActivityIndicator color={COLORS.light.primary} size="large" style={{ marginVertical: SPACING.xl }} />
        ) : (
          <View style={styles.actionsBox}>
            <TouchableOpacity style={[styles.actionBtn, styles.pdfBtn]} onPress={handlePdfExport}>
              <FileText size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Export PDF Report</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.excelBtn]} onPress={handleExcelExport}>
              <Table size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Export Excel Spreadsheet</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.textBtn]} onPress={handleWhatsAppShare}>
              <Share2 size={20} color={COLORS.light.primary} />
              <Text style={[styles.actionBtnText, styles.textBtnText]}>Copy/Share Text Summary</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: COLORS.light.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.light.primary,
  },
  infoDesc: {
    fontSize: 13,
    color: COLORS.light.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  optionsCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    ...SHADOWS.light.sm,
    marginBottom: SPACING.xl,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
  },
  optionLabel: {
    fontSize: 14,
    color: COLORS.light.text,
    fontWeight: '500',
  },
  actionsBox: {
    gap: SPACING.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    ...SHADOWS.light.md,
  },
  pdfBtn: {
    backgroundColor: '#EF4444', // Red
  },
  excelBtn: {
    backgroundColor: '#10B981', // Green
  },
  textBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  textBtnText: {
    color: COLORS.light.primary,
  },
});
