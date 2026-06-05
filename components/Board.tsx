import React, { useEffect, useRef, useMemo } from 'react';
import {
  View, TouchableOpacity, StyleSheet, Text,
  useWindowDimensions, Animated,
} from 'react-native';
import { rs, ThemeColors, nativeDriver } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import { Board as BoardType } from '../utils/gameLogic';

interface BoardProps {
  board: BoardType;
  onCellPress: (index: number) => void;
  isMyTurn: boolean;
  winningCombo: number[] | null;
  disabled: boolean;
  onValidPress?: () => void;
}

export default function Board({
  board, onCellPress, isMyTurn, winningCombo, disabled, onValidPress,
}: BoardProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { width, height } = useWindowDimensions();

  const boardSize = Math.min(width - 40, height * 0.42, 340);
  const cellSize = boardSize / 3;
  const circleSize = Math.round(cellSize * 0.64);
  const xFontSize = Math.round(cellSize * 0.62);

  const scales = useRef(Array.from({ length: 9 }, () => new Animated.Value(1))).current;
  const lineAnim = useRef(new Animated.Value(0)).current;
  const prevBoard = useRef<BoardType>(Array(9).fill(null));

  useEffect(() => {
    board.forEach((cell, i) => {
      if (cell !== null && prevBoard.current[i] === null) {
        scales[i].setValue(0.2);
        Animated.spring(scales[i], {
          toValue: 1, tension: 280, friction: 9, useNativeDriver: nativeDriver,
        }).start();
      }
    });
    prevBoard.current = [...board];
  }, [board]);

  useEffect(() => {
    lineAnim.setValue(0);
    if (winningCombo) {
      Animated.timing(lineAnim, { toValue: 1, duration: 420, useNativeDriver: nativeDriver }).start();
    }
  }, [winningCombo]);

  const lineStyle = (() => {
    if (!winningCombo) return null;
    const [a, , c] = winningCombo;
    const x1 = (a % 3) * cellSize + cellSize / 2;
    const y1 = Math.floor(a / 3) * cellSize + cellSize / 2;
    const x2 = (c % 3) * cellSize + cellSize / 2;
    const y2 = Math.floor(c / 3) * cellSize + cellSize / 2;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) + cellSize * 0.45;
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    const lineColor = board[winningCombo[0]] === 'O' ? colors.cyan : colors.orange;
    return { cx, cy, length, angle, lineColor };
  })();

  const isWinCell = (i: number) => winningCombo?.includes(i) ?? false;

  return (
    <View style={[s.container, { width: boardSize, height: boardSize }]}>
      <View style={s.grid}>
        <View style={[s.vLine, { left: '33.33%' }]} />
        <View style={[s.vLine, { left: '66.66%' }]} />
        <View style={[s.hLine, { top: '33.33%' }]} />
        <View style={[s.hLine, { top: '66.66%' }]} />
      </View>

      <View style={s.cells}>
        {board.map((cell, i) => {
          const win = isWinCell(i);
          const empty = cell === null || cell === undefined;
          const canPress = empty && isMyTurn && !disabled;
          return (
            <TouchableOpacity
              key={i}
              style={[
                s.cell,
                { width: cellSize, height: cellSize },
                win && cell === 'O' && s.cellWinO,
                win && cell === 'X' && s.cellWinX,
              ]}
              onPress={() => { if (!canPress) return; onCellPress(i); onValidPress?.(); }}
              activeOpacity={canPress ? 0.65 : 1}
              disabled={!canPress}
            >
              <Animated.View style={{ transform: [{ scale: scales[i] }] }}>
                {cell === 'O' && (
                  <View style={[s.symbolO, win && s.symbolOWin]}>
                    <View style={[
                      s.circleOuter,
                      { width: circleSize, height: circleSize, borderRadius: circleSize / 2 },
                    ]}>
                      <View style={[
                        s.circleInner,
                        { width: circleSize * 0.3, height: circleSize * 0.3, borderRadius: circleSize * 0.15 },
                      ]} />
                    </View>
                  </View>
                )}
                {cell === 'X' && (
                  <View style={[s.symbolX, win && s.symbolXWin]}>
                    <Text style={[s.xText, { fontSize: xFontSize, lineHeight: xFontSize * 1.15 }, win && s.xTextWin]}>
                      ✕
                    </Text>
                  </View>
                )}
                {empty && isMyTurn && !disabled && <View style={s.ghostDot} />}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>

      {lineStyle && (
        <Animated.View
          style={[
            s.winLine,
            {
              left: lineStyle.cx - lineStyle.length / 2,
              top: lineStyle.cy - 5,
              width: lineStyle.length,
              backgroundColor: lineStyle.lineColor,
              shadowColor: lineStyle.lineColor,
              transform: [{ rotate: `${lineStyle.angle}deg` }, { scaleX: lineAnim }],
            },
          ]}
        />
      )}
    </View>
  );
}

const makeStyles = (c: ThemeColors) => StyleSheet.create({
  container: { alignSelf: 'center', position: 'relative' },
  grid: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  vLine: {
    position: 'absolute', top: '8%', bottom: '8%', width: 1.5,
    backgroundColor: c.cyanDim,
    shadowColor: c.cyan, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.6, shadowRadius: 4,
  },
  hLine: {
    position: 'absolute', left: '8%', right: '8%', height: 1.5,
    backgroundColor: c.cyanDim,
    shadowColor: c.cyan, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.6, shadowRadius: 4,
  },
  cells: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', zIndex: 2 },
  cell: { alignItems: 'center', justifyContent: 'center' },
  cellWinO: { backgroundColor: c.cyanGlow },
  cellWinX: { backgroundColor: c.orangeGlow },
  symbolO: { alignItems: 'center', justifyContent: 'center' },
  symbolOWin: {
    shadowColor: c.cyan, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity, shadowRadius: 14, elevation: 10,
  },
  circleOuter: {
    borderWidth: 4, borderColor: c.cyan, alignItems: 'center', justifyContent: 'center',
    shadowColor: c.cyan, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.8, shadowRadius: 8, elevation: 8,
  },
  circleInner: { backgroundColor: c.cyanGlow },
  symbolX: { alignItems: 'center', justifyContent: 'center' },
  symbolXWin: {
    shadowColor: c.orange, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity, shadowRadius: 14, elevation: 10,
  },
  xText: {
    fontWeight: '900', color: c.orange,
    shadowColor: c.orange, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity * 0.8, shadowRadius: 8,
  },
  xTextWin: { color: c.orange },
  ghostDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: c.border,
  },
  winLine: {
    position: 'absolute', height: 10, borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: c.glowIntensity + 0.2, shadowRadius: 10, elevation: 14, zIndex: 10,
  },
});
