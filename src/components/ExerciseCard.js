// src/components/ExerciseCard.js
import React from 'react';
import { Card, Title, Paragraph } from 'react-native-paper';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

const ExerciseCard = ({ exercise, onSelect }) => {
  return (
    <TouchableOpacity onPress={() => onSelect(exercise)}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{exercise.name}</Title>
          {exercise.description && (
            <Paragraph style={styles.description}>
              {exercise.description}
            </Paragraph>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    elevation: 3, // Тень для Android
    shadowColor: '#000', // Тень для iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.placeholder,
    marginTop: 4,
  },
});

export default ExerciseCard;