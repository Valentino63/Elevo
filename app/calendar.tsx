import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SCREEN_W = Dimensions.get('window').width;
const H_PAD = 24;
const CELL_GAP = 3;
const CELL_SIZE = Math.floor((SCREEN_W - H_PAD * 2 - CELL_GAP * 6) / 7);

function xpToColor(xp: number, maxXp: number): string {
  if (!xp || maxXp === 0) return '#1e1e1e';
  const t = 0.15 + 0.85 * Math.min(xp / maxXp, 1);
  return `rgb(${Math.round(30 + 171 * t)},${Math.round(30 + 138 * t)},${Math.round(30 + 46 * t)})`;
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function weekSundayOf(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const s = new Date(d);
  s.setDate(d.getDate() - d.getDay());
  return isoDate(s.getFullYear(), s.getMonth(), s.getDate());
}

function formatMonthKey(mk: string): string {
  const [y, m] = mk.split('-');
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
}

export default function CalendarScreen() {
  const router = useRouter();
  const todayDate = new Date();
  const [displayYear, setDisplayYear] = useState(todayDate.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(todayDate.getMonth());
  const [dailyXp, setDailyXp] = useState<Record<string, number>>({});

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('elevo_daily_xp').then(raw => {
        setDailyXp(raw ? JSON.parse(raw) : {});
      });
    }, [])
  );

  const maxXp = useMemo(
    () => Math.max(1, ...Object.values(dailyXp)),
    [dailyXp]
  );

  const { bestDayKey, bestDayXp, bestWeekSunday, bestWeekXp, bestMonthKey, bestMonthXp } =
    useMemo(() => {
      let bdk = '', bdx = 0, bws = '', bwx = 0, bmk = '', bmx = 0;
      const weekTotals: Record<string, number> = {};
      const monthTotals: Record<string, number> = {};

      for (const [date, xp] of Object.entries(dailyXp)) {
        if (xp > bdx) { bdx = xp; bdk = date; }
        const sun = weekSundayOf(date);
        weekTotals[sun] = (weekTotals[sun] ?? 0) + xp;
        const mk = date.slice(0, 7);
        monthTotals[mk] = (monthTotals[mk] ?? 0) + xp;
      }
      for (const [sun, xp] of Object.entries(weekTotals)) {
        if (xp > bwx) { bwx = xp; bws = sun; }
      }
      for (const [mk, xp] of Object.entries(monthTotals)) {
        if (xp > bmx) { bmx = xp; bmk = mk; }
      }
      return { bestDayKey: bdk, bestDayXp: bdx, bestWeekSunday: bws, bestWeekXp: bwx, bestMonthKey: bmk, bestMonthXp: bmx };
    }, [dailyXp]);

  const currentMonthKey = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}`;
  const monthTotal = useMemo(() => {
    let total = 0;
    for (const [date, xp] of Object.entries(dailyXp)) {
      if (date.startsWith(currentMonthKey)) total += xp;
    }
    return total;
  }, [dailyXp, currentMonthKey]);

  const isCurrentMonthBest = bestMonthKey === currentMonthKey && bestMonthXp > 0;

  // Build calendar grid
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDow = new Date(displayYear, displayMonth, 1).getDay();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const goBack = () => {
    if (displayMonth === 0) { setDisplayYear(y => y - 1); setDisplayMonth(11); }
    else setDisplayMonth(m => m - 1);
  };
  const goForward = () => {
    if (displayMonth === 11) { setDisplayYear(y => y + 1); setDisplayMonth(0); }
    else setDisplayMonth(m => m + 1);
  };

  const hasData = Object.keys(dailyXp).length > 0;

  return (
    <View style={styles.container}>
      {/* Screen header */}
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Calendar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Month navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goBack} style={styles.navBtn}>
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>
          <View style={styles.monthInfo}>
            <View style={styles.monthTitleRow}>
              <Text style={styles.monthTitle}>
                {MONTH_NAMES[displayMonth]} {displayYear}
              </Text>
              {isCurrentMonthBest && (
                <Text style={styles.bestBadge}>★ Best</Text>
              )}
            </View>
            <Text style={styles.monthSubtitle}>
              {monthTotal > 0 ? `${monthTotal.toLocaleString()} XP this month` : 'No data yet'}
            </Text>
          </View>
          <TouchableOpacity onPress={goForward} style={styles.navBtn}>
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day-of-week labels */}
        <View style={styles.dayLabelRow}>
          {DAY_LABELS.map(d => (
            <Text key={d} style={styles.dayLabel}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {rows.map((row, ri) => {
            // Determine if this row is the best week
            const firstReal = row.find(d => d !== null);
            let isWeekBest = false;
            if (firstReal != null) {
              const rowSun = weekSundayOf(isoDate(displayYear, displayMonth, firstReal));
              isWeekBest = rowSun === bestWeekSunday && bestWeekXp > 0;
            }

            return (
              <View key={ri} style={[styles.row, isWeekBest && styles.rowBestWeek]}>
                {row.map((day, ci) => {
                  if (day === null) {
                    return <View key={ci} style={styles.emptyCell} />;
                  }
                  const dk = isoDate(displayYear, displayMonth, day);
                  const xp = dailyXp[dk] ?? 0;
                  const color = xpToColor(xp, maxXp);
                  const isBestDay = dk === bestDayKey && bestDayXp > 0;
                  const isToday =
                    displayYear === todayDate.getFullYear() &&
                    displayMonth === todayDate.getMonth() &&
                    day === todayDate.getDate();

                  return (
                    <View
                      key={ci}
                      style={[
                        styles.cell,
                        { backgroundColor: color },
                        isBestDay && styles.cellBestDay,
                        isToday && !isBestDay && styles.cellToday,
                      ]}>
                      <Text style={[styles.cellText, xp > 0 && styles.cellTextActive]}>
                        {day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>

        {/* Stats */}
        {hasData && (
          <View style={styles.stats}>
            {bestDayKey !== '' && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Best day</Text>
                <Text style={styles.statValue}>
                  {bestDayKey}  ·  {bestDayXp.toLocaleString()} XP
                </Text>
              </View>
            )}
            {bestWeekSunday !== '' && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Best week</Text>
                <Text style={styles.statValue}>
                  w/c {bestWeekSunday}  ·  {bestWeekXp.toLocaleString()} XP
                </Text>
              </View>
            )}
            {bestMonthKey !== '' && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Best month</Text>
                <Text style={styles.statValue}>
                  {formatMonthKey(bestMonthKey)}  ·  {bestMonthXp.toLocaleString()} XP
                </Text>
              </View>
            )}
          </View>
        )}

        {!hasData && (
          <Text style={styles.emptyNote}>
            Log your first activity to start building your heatmap.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  backText: { color: '#c9a84c', fontSize: 22 },
  screenTitle: { color: '#c9a84c', fontSize: 18, fontWeight: 'bold' },
  scroll: { paddingBottom: 48 },

  // Month navigator
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  navBtn: { padding: 8 },
  navArrow: { color: '#c9a84c', fontSize: 28, lineHeight: 28 },
  monthInfo: { alignItems: 'center', flex: 1 },
  monthTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthTitle: { color: '#e8e0cc', fontSize: 18, fontWeight: 'bold' },
  bestBadge: { color: '#c9a84c', fontSize: 11, fontWeight: 'bold' },
  monthSubtitle: { color: '#5a5650', fontSize: 13, marginTop: 4 },

  // Day labels
  dayLabelRow: {
    flexDirection: 'row',
    paddingHorizontal: H_PAD,
    marginBottom: 6,
  },
  dayLabel: {
    width: CELL_SIZE,
    textAlign: 'center',
    color: '#5a5650',
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: CELL_GAP,
  },

  // Grid
  grid: { paddingHorizontal: H_PAD },
  row: {
    flexDirection: 'row',
    marginBottom: CELL_GAP,
    borderRadius: 6,
  },
  rowBestWeek: {
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    borderRadius: 6,
    marginHorizontal: -1,
    paddingHorizontal: 1,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: CELL_GAP,
  },
  emptyCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    marginRight: CELL_GAP,
  },
  cellBestDay: {
    borderWidth: 2,
    borderColor: '#c9a84c',
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: '#e8e0cc',
  },
  cellText: {
    color: '#3a3a3a',
    fontSize: 11,
    fontWeight: '600',
  },
  cellTextActive: {
    color: '#0a0a0a',
  },

  // Stats section
  stats: {
    marginTop: 28,
    marginHorizontal: H_PAD,
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e1e1e',
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  statLabel: {
    color: '#5a5650',
    fontSize: 13,
  },
  statValue: {
    color: '#e8e0cc',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyNote: {
    color: '#5a5650',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: H_PAD,
    lineHeight: 20,
  },
});
