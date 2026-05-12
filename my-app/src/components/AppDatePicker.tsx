import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  SafeAreaView, 
  Dimensions 
} from 'react-native';
import { CalendarList, LocaleConfig } from 'react-native-calendars';
import { format, addDays, differenceInDays, isBefore, startOfDay, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';

// Configure Vietnamese locale for calendar
LocaleConfig.locales['vi'] = {
  monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
  monthNamesShort: ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'],
  dayNames: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
  dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  today: 'Hôm nay'
};
LocaleConfig.defaultLocale = 'vi';

const { width } = Dimensions.get('window');
const MAIN_COLOR = '#5392F9';
const LIGHT_COLOR = '#E6F0FF';

interface AppDatePickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (checkIn: Date, checkOut: Date) => void;
  initialCheckIn?: Date;
  initialCheckOut?: Date;
}

const AppDatePicker = ({ visible, onClose, onConfirm, initialCheckIn, initialCheckOut }: AppDatePickerProps) => {
  const [startDate, setStartDate] = useState<string | null>(
    initialCheckIn ? format(initialCheckIn, 'yyyy-MM-dd') : null
  );
  const [endDate, setEndDate] = useState<string | null>(
    initialCheckOut ? format(initialCheckOut, 'yyyy-MM-dd') : null
  );

  const onDayPress = (day: any) => {
    const dateString = day.dateString;
    
    // If selecting a past date, do nothing
    if (isBefore(parseISO(dateString), startOfDay(new Date()))) return;

    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(dateString);
      setEndDate(null);
    } else {
      // Selecting the end date
      if (isBefore(parseISO(dateString), parseISO(startDate))) {
        // If end is before start, make it the new start
        setStartDate(dateString);
      } else if (dateString === startDate) {
        // Deselect if clicking same day
        setStartDate(null);
      } else {
        setEndDate(dateString);
      }
    }
  };

  const markedDates = useMemo(() => {
    if (!startDate) return {};

    let marks: any = {
      [startDate]: { 
        startingDay: true, 
        color: MAIN_COLOR, 
        textColor: 'white',
        selected: true,
        customStyles: { container: { borderRadius: 8 } }
      }
    };

    if (endDate) {
      marks[endDate] = { 
        endingDay: true, 
        color: MAIN_COLOR, 
        textColor: 'white',
        selected: true,
        customStyles: { container: { borderRadius: 8 } }
      };

      // Fill in dates between
      let start = parseISO(startDate);
      let end = parseISO(endDate);
      let diff = differenceInDays(end, start);

      for (let i = 1; i < diff; i++) {
        const midDate = format(addDays(start, i), 'yyyy-MM-dd');
        marks[midDate] = { 
          color: LIGHT_COLOR, 
          textColor: MAIN_COLOR,
          selected: true
        };
      }
    }

    return marks;
  }, [startDate, endDate]);

  const nights = useMemo(() => {
    if (startDate && endDate) {
      return differenceInDays(parseISO(endDate), parseISO(startDate));
    }
    return 0;
  }, [startDate, endDate]);

  const handleConfirm = () => {
    if (startDate && endDate) {
      onConfirm(parseISO(startDate), parseISO(endDate));
      onClose();
    }
  };

  const formatDateText = (dateStr: string | null) => {
    if (!dateStr) return '---';
    return format(parseISO(dateStr), 'eee, dd MMM', { locale: vi });
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent={false}
      statusBarTranslucent={true}
      presentationStyle="fullScreen"
    >
      <View style={styles.fullScreenContainer}>
        <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="chevron-back" size={28} color="rgba(83, 146, 249, 0.7)" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn ngày</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={{ flex: 1 }}>
          <CalendarList
            theme={{
              selectedDayBackgroundColor: MAIN_COLOR,
              selectedDayTextColor: '#ffffff',
              todayTextColor: MAIN_COLOR,
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              monthTextColor: '#333',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 16,
              textMonthFontSize: 18,
            }}
            pastScrollRange={0}
            futureScrollRange={12}
            scrollEnabled={true}
            showScrollIndicator={true}
            onDayPress={onDayPress}
            markedDates={markedDates}
            markingType={'period'}
            minDate={format(new Date(), 'yyyy-MM-dd')}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.infoRow}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>NHẬN PHÒNG</Text>
              <Text style={styles.dateValue}>{formatDateText(startDate)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>TRẢ PHÒNG</Text>
              <Text style={styles.dateValue}>{formatDateText(endDate)}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.confirmButton, (!startDate || !endDate) && styles.disabledButton]}
            onPress={handleConfirm}
            disabled={!startDate || !endDate}
          >
            <Text style={styles.confirmText}>
              Xác nhận {nights > 0 ? `(${nights} đêm)` : ''}
            </Text>
          </TouchableOpacity>
        </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: { flex: 1, backgroundColor: '#FFF', paddingTop: 30 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#333' },
  closeButton: { padding: 4 },
  footer: {
    padding: 15,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateBox: { flex: 1, alignItems: 'center' },
  dateLabel: { fontSize: 9, color: '#999', marginBottom: 2 },
  dateValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  divider: { width: 1, height: 30, backgroundColor: '#EEE' },
  confirmButton: {
    backgroundColor: MAIN_COLOR,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: { 
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default AppDatePicker;
