import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { COLORS } from '../utils/theme';
import { Board as BoardType } from '../utils/gameLogic';

interface BoardProps {
  board: BoardType;
  onCellPress: (index: number) => void;
  isMyTurn: boolean;
  winningCombo: number[] | null;
  disabled: boolean;
}

export default function Board({ board, onCellPress, isMyTurn, winningCombo, disabled }: BoardProps) {
  const { width, height } = useWindowDimensions();
  // Board size: smaller of (width - padding) or a portion of height
  const boardSize = Math.min(width - 40, height * 0.42, 340);
  const cellSize = boardSize / 3;
  const circleSize = Math.round(cellSize * 0.64);
  const xFontSize = Math.round(cellSize * 0.62);

  const isWinningCell = (index: number) => winningCombo?.includes(index) ?? false;

  return (
    <View style={[styles.boardContainer, { width: boardSize, height: boardSize }]}>
      {/* Grid lines */}
      <View style={styles.gridLines}>
        <View style={[styles.vLine, { left: '33.33%' }]} />
        <View style={[styles.vLine, { left: '66.66%' }]} />
        <View style={[styles.hLine, { top: '33.33%' }]} />
        <View style={[styles.hLine, { top: '66.66%' }]} />
      </View>

      {/* Cells */}
      <View style={styles.grid}>
        {board.map((cell, index) => {
          const isWin = isWinningCell(index);
          const isEmpty = cell === null || cell === undefined;
          const canPress = isEmpty && isMyTurn && !disabled;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.cell,
                { width: cellSize, height: cellSize },
                isWin && cell === 'O' && styles.cellWinO,
                isWin && cell === 'X' && styles.cellWinX,
              ]}
              onPress={() => canPress && onCellPress(index)}
              activeOpacity={canPress ? 0.7 : 1}
              disabled={!canPress}
            >
              {cell === 'O' && (
                <View style={[styles.symbolO, isWin && styles.symbolOWin]}>
                  <View style={[
                    styles.circleOuter,
                    { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }
                  ]}>
                    <View style={[
                      styles.circleInner,
                      { width: circleSize * 0.3, height: circleSize * 0.3, borderRadius: circleSize * 0.15 }
                    ]} />
                  </View>
                </View>
              )}
              {cell === 'X' && (
                <View style={[styles.symbolX, isWin && styles.symbolXWin]}>
                  <Text style={[styles.xText, { fontSize: xFontSize, lineHeight: xFontSize * 1.15 }, isWin && styles.xTextWin]}>✕</Text>
                </View>
              )}
              {isEmpty && isMyTurn && !disabled && (
                <View style={styles.ghostDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardContainer: {
    alignSelf: 'center',
    position: 'relative',
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  vLine: {
    position: 'absolute',
    top: '8%',
    bottom: '8%',
    width: 1.5,
    backgroundColor: 'rgba(0,212,255,0.25)',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  hLine: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    height: 1.5,
    backgroundColor: 'rgba(0,212,255,0.25)',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    zIndex: 2,
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cellWinO: {
    backgroundColor: 'rgba(0,212,255,0.08)',
  },
  cellWinX: {
    backgroundColor: 'rgba(255,107,53,0.08)',
  },
  symbolO: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolOWin: {
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 10,
  },
  circleOuter: {
    borderWidth: 4,
    borderColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 8,
  },
  circleInner: {
    backgroundColor: 'rgba(0,212,255,0.15)',
  },
  symbolX: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolXWin: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 10,
  },
  xText: {
    fontWeight: '900',
    color: COLORS.orange,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  xTextWin: {
    color: '#FF8C5A',
  },
  ghostDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
