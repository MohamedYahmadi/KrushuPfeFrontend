import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';

// Mock data for the dashboard
const kpiData = [
  {
    category: 'People',
    metrics: [
      { name: 'Absenteeism %', target: '1', values: ['1', '0', '0', '0', '0', '0', '0'] },
      { name: 'Fluctuation %', target: '1', values: ['1', '1', '1', '1', '1', '1', '1'] },
      { name: 'Qual L (Qualification Level) %', target: '100', values: ['100', '100', '100', '100', '100', '100', '100'] },
      { name: 'Qual B (Qualification Back up) %', target: '100', values: ['100', '85', '90', '85', '88', '85', '85'] },
    ]
  },
  {
    category: 'Quality',
    metrics: [
      { name: 'Fault Elimination - RFR 1/2', target: '3', values: ['3', '33', '40', '38', '39', '36', '35'] },
      { name: 'PPM / Hotline', target: '1', values: ['1', '0', '0', '0', '0', '0', '0'] },
      { name: 'LPA - %', target: '4', values: ['4', '4', '4', '4', '4', '4', '4'] },
      { name: 'Scrap - Kg', target: '25', values: ['25', '15', '15', '15', '14', '15', '15'] },
    ]
  },
  {
    category: 'Logistics',
    metrics: [
      { name: 'Delivery Status (Backlog / current date) - pcs', target: '0', values: ['0', '0', '0', '0', '0', '0', '0'] },
      { name: 'Open Orders', target: '50,000', values: ['50,000', '40k', '45k', '40k', '42k', '40k', '40k'] },
      { name: 'Material availability - incidents (# of blocks/Kan.ord.)', target: '100', values: ['100', '100', '100', '100', '100', '100', '100'] },
      { name: 'Efficiency %', target: '100', values: ['100', '98', '98', '98', '100', '98', '98'] },
    ]
  },
  {
    category: 'Productivity',
    metrics: [
      { name: 'OEE Foaming', target: '1500', values: ['1500', '1400', '1350', '1420', '1510', '1500', '1500'] },
      { name: 'Production Volume', target: '0', values: ['0', '0', '0', '0', '0', '0', '0'] },
      { name: 'Foaming Downtime - min', target: '0', values: ['0', '0', '0', '0', '0', '0', '0'] },
      { name: 'Total Downtime - min', target: '60', values: ['60', '65', '60', '60', '62', '65', '65'] },
      { name: 'Nbr of Molding Setup', target: '5', values: ['5', '25', '30', '25', '27', '30', '30'] },
      { name: 'Molding Setup Time', target: '120', values: ['120', '125', '130', '125', '127', '130', '130'] },
      { name: 'Machine availability', target: '100', values: ['100', '100', '100', '100', '100', '100', '100'] },
      { name: 'Gemba -Nb of implement improvements in the last month', target: '10', values: ['10', '10', '10', '10', '10', '10', '10'] },
      { name: '5S', target: '10', values: ['10', '10', '10', '10', '10', '10', '10'] },
    ]
  },
];

const days = ['Target', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const actionItems = [
  "1) Assurer do no speed, la documentation - selon la variante",
  "2) Ajustement Machine + Supervision avec la variante",
  "3) Simplification workflow by process & travail (Supervision) avec la variante"
];

const topWasteReasons = [
  "1) Scrap vs Unpack",
  "2) Downtime / Waiting",
  "3) Inventory"
];

export function DashBoardHome() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState(0);
  const scrollViewRef = useRef(null);
  const windowWidth = Dimensions.get('window').width;

  // Calculate table width based on number of columns
  const tableWidth = 150 + (days.length * 80) + 200; // categoryCell + dayCells + notesCell
  const isTableWiderThanScreen = tableWidth > windowWidth;

  const handlePrevCategory = () => {
    if (activeCategory > 0) {
      setActiveCategory(activeCategory - 1);
    }
  };

  const handleNextCategory = () => {
    if (activeCategory < kpiData.length - 1) {
      setActiveCategory(activeCategory + 1);
    }
  };

  // Function to determine if a value is better than, equal to, or worse than target
  const getValueStatus = (value: string, target: string, metricName: string): string => {
    // For some metrics, lower is better (like downtime, scrap)
    const lowerIsBetter = metricName.includes('Downtime') ||
        metricName.includes('Scrap') ||
        metricName.includes('Absenteeism') ||
        metricName.includes('Fluctuation') ||
        metricName.includes('PPM');

    // Skip comparison for target column
    if (value === target) return 'neutral';

    // Parse values to numbers if possible for comparison
    let numValue = parseFloat(value.replace('k', '000').replace('%', ''));
    let numTarget = parseFloat(target.replace('k', '000').replace('%', ''));

    // If parsing failed, do string comparison
    if (isNaN(numValue) || isNaN(numTarget)) {
      return 'neutral';
    }

    if (lowerIsBetter) {
      return numValue < numTarget ? 'better' : numValue > numTarget ? 'worse' : 'neutral';
    } else {
      return numValue > numTarget ? 'better' : numValue < numTarget ? 'worse' : 'neutral';
    }
  };

  return (
      <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={true}
      >
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>KS</Text>
              <View>
                <Text style={styles.logoSubtitle}>Production</Text>
                <Text style={styles.logoSubtitle}>System</Text>
              </View>
            </View>
            <Text style={styles.headerTitle}>Shop Floor Management Foaming PROJECT</Text>
          </View>

          {/* Category Navigation */}
          <View style={styles.categoryNavigation}>
            <TouchableOpacity
                style={[styles.navButton, activeCategory === 0 && styles.navButtonDisabled]}
                onPress={handlePrevCategory}
                disabled={activeCategory === 0}
            >
              <Text style={styles.navButtonText}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={styles.categoryTitle}>{kpiData[activeCategory].category}</Text>
            <TouchableOpacity
                style={[styles.navButton, activeCategory === kpiData.length - 1 && styles.navButtonDisabled]}
                onPress={handleNextCategory}
                disabled={activeCategory === kpiData.length - 1}
            >
              <Text style={styles.navButtonText}>{">"}</Text>
            </TouchableOpacity>
          </View>

          {/* Table with horizontal scrolling */}
          <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              ref={scrollViewRef}
              style={styles.horizontalScrollView}
          >
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <View style={styles.categoryCell}>
                  <Text style={styles.headerText}>KPI</Text>
                </View>
                {days.map((day, index) => (
                    <View key={index} style={[
                      styles.dayCell,
                      day === 'Th' ? styles.highlightedDay : null,
                      day === 'Target' ? styles.targetCell : null,
                      index === 0 ? styles.firstColumn : null, // Add left border for the first column
                    ]}>
                      <Text style={styles.headerText}>{day}</Text>
                    </View>
                ))}
                <View style={[styles.notesCell, styles.lastColumn]}>
                  <Text style={styles.headerText}>Top waste per day - Reasons</Text>
                </View>
              </View>

              {/* Table Body - Only show active category */}
              <View>
                {/* Metrics for active category */}
                {kpiData[activeCategory].metrics.map((metric, metricIndex) => (
                    <View key={metricIndex} style={styles.metricRow}>
                      <View style={styles.categoryCell}>
                        <Text style={styles.metricText}>{metric.name}</Text>
                      </View>
                      {metric.values.map((value, valueIndex) => {
                        const status = valueIndex === 0 ? 'neutral' :
                            getValueStatus(value, metric.target, metric.name);

                        return (
                            <View key={valueIndex} style={[
                              styles.valueCell,
                              valueIndex === 4 ? styles.highlightedDay : null,
                              valueIndex === 0 ? styles.targetCell : null,
                              valueIndex === 0 ? styles.firstColumn : null, // Add left border for the first column
                            ]}>
                              <Text style={[
                                styles.valueText,
                                status === 'better' ? styles.betterValue : null,
                                status === 'worse' ? styles.worseValue : null
                              ]}>
                                {value}
                              </Text>
                            </View>
                        );
                      })}
                      {metricIndex < topWasteReasons.length ? (
                          <View style={[styles.notesCell, styles.lastColumn]}>
                            <Text style={styles.notesText}>{topWasteReasons[metricIndex]}</Text>
                          </View>
                      ) : (
                          <View style={[styles.notesCell, styles.lastColumn]} />
                      )}
                    </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Horizontal scroll indicator */}
          {isTableWiderThanScreen && (
              <View style={styles.scrollIndicator}>
                <Text style={styles.scrollIndicatorText}>← Swipe to see more →</Text>
              </View>
          )}

          {/* Action Items Section */}
          <View style={styles.actionSection}>
            <View style={styles.actionHeader}>
              <Text style={styles.actionHeaderText}>Action Settings</Text>
            </View>
            <View style={styles.actionSubHeader}>
              <Text style={styles.actionSubHeaderText}>Action</Text>
            </View>
            <View style={styles.actionItems}>
              {actionItems.map((item, index) => (
                  <Text key={index} style={styles.actionItemText}>{item}</Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6b4c8c',
    marginRight: 5,
  },
  logoSubtitle: {
    fontSize: 12,
    color: '#6b4c8c',
    lineHeight: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  categoryNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 10,
  },
  navButtonDisabled: {
    backgroundColor: '#f8f8f8',
  },
  navButtonText: {
    fontSize: 18,
    color: '#6b4c8c',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b4c8c',
    paddingHorizontal: 20,
  },
  horizontalScrollView: {
    flex: 1,
  },
  tableContainer: {
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#6b4c8c',
  },
  categoryCell: {
    width: 150,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#8a6bab',
    justifyContent: 'center',
  },
  dayCell: {
    width: 80,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#8a6bab',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetCell: {
    backgroundColor: '#8a6bab',
  },
  highlightedDay: {
    backgroundColor: '#5a3c7c',
  },
  firstColumn: {
    borderLeftWidth: 2, // Add a left border to separate columns
    borderLeftColor: '#8a6bab',
  },
  lastColumn: {
    borderRightWidth: 2, // Add a right border to separate columns
    borderRightColor: '#8a6bab',
  },
  notesCell: {
    width: 200,
    padding: 12,
    justifyContent: 'center',
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  metricText: {
    fontSize: 14,
    color: '#333',
  },
  valueCell: {
    width: 80,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
  betterValue: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  worseValue: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  notesText: {
    fontSize: 14,
    color: '#333',
  },
  scrollIndicator: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(107, 76, 140, 0.1)',
  },
  scrollIndicatorText: {
    fontSize: 12,
    color: '#6b4c8c',
  },
  actionSection: {
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionHeader: {
    backgroundColor: '#6b4c8c',
    padding: 12,
  },
  actionHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionSubHeader: {
    backgroundColor: '#8a6bab',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  actionSubHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionItems: {
    padding: 16,
  },
  actionItemText: {
    fontSize: 14,
    marginBottom: 10,
    color: '#333',
  },
});