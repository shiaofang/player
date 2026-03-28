// @ts-nocheck
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../theme/colors';

export default function AlbumCard({ artwork, title, subtitle, size = 150, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: artwork }} style={[styles.artwork, { width: size, height: size }]} />
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
  },
  artwork: {
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
});

