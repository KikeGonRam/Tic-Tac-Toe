// components/Board.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
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
  const isWinningCell = (index: number) => winningCombo?.includes(index) ?? false;

  return (
    <View style={styles.boardContainer}>
      {/* Grid lines decorative */}
      <View style={styles.gridLines}>
        {/* Vertical lines */}
        <View style={[styles.vLine, { left: '33.33%' }]} />
        <View style={[styles.vLine, { left: '66.66%' }]} />
        {/* Horizontal lines */}
        <View style={[styles.hLine, { top: '33.33%' }]} />
        <View style={[styles.hLine, { top: '66.66%' }]} />
      </View>

      {/* Cells */}
      <View style={styles.grid}>
        {board.map((cell, index) => {
          const isWin = isWinningCell(index);
          const isEmpty = cell === null;
          const canPress = isEmpty && isMyTurn && !disabled;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.cell,
                isWin && cell === 'O' && styles.cellWinO,
                isWin && cell === 'X' && styles.cellWinX,
                canPress && styles.cellHoverable,
              ]}
              onPress={() => canPress && onCellPress(index)}
              activeOpacity={canPress ? 0.7 : 1}
              disabled={!canPress}
            >
              {cell === 'O' && (
                <View style={[styles.symbolO, isWin && styles.symbolOWin]}>
                  <View style={styles.circleOuter}>
                    <View style={styles.circleInner} />
                  </View>
                </View>
              )}
              {cell === 'X' && (
                <View style={[styles.symbolX, isWin && styles.symbolXWin]}>
                  <Text style={[styles.xText, isWin && styles.xTextWin]}>✕</Text>
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
    width: '100%',
    aspectRatio: 1,
    maxWidth: 340,
    maxHeight: 340,
    position: 'relative',
    alignSelf: 'center',
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
    width: '33.33%',
    height: '33.33%',
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
  cellHoverable: {
    // subtle press state
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
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 5,
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
    width: 20,
    height: 20,
    borderRadius: 10,
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
    fontSize: 58,
    fontWeight: '900',
    color: COLORS.orange,
    lineHeight: 70,
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
