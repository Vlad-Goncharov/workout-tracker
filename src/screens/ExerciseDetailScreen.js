// src/screens/ExerciseDetailScreen.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { colors } from '../theme/colors';

const ExerciseDetailScreen = ({ navigation, route }) => {
  // You can access exercise details via route.params if passed from ExerciseLibraryScreen
  const { exercise } = route.params || {};

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={colors.onPrimary} />
        <Appbar.Content
          title={exercise?.name || "Детали упражнения"}
          titleStyle={styles.appBarTitle}
        />
      </Appbar.Header>

      <View style={styles.content}>
        {exercise ? (
          <>
            <Text style={styles.detailText}>Название: {exercise.name}</Text>
            <Text style={styles.detailText}>Группа мышц: {exercise.muscleGroup || 'Не указана'}</Text>
            <Text style={styles.detailText}>Описание: {exercise.description || 'Нет описания'}</Text>
            {/* Добавьте другие детали упражнения здесь */}
          </>
        ) : (
          <Text style={styles.noExerciseText}>Упражнение не найдено.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appBar: {
    backgroundColor: colors.primary,
  },
  appBarTitle: {
    color: colors.onPrimary,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  noExerciseText: {
    fontSize: 16,
    color: colors.placeholder,
    textAlign: 'center',
  },
});

export default ExerciseDetailScreen;