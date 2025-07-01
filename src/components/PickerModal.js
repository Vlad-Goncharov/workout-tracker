// src/components/PickerModal.js
import React from 'react';
import { Modal, View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Card, Appbar, Searchbar } from 'react-native-paper';
import { colors } from '../theme/colors';

const PickerModal = ({
  visible,
  onClose,
  data, // Array of { id: string, name: string, ... }
  onSelect,
  title = "Выберите элемент",
  searchPlaceholder = "Поиск...",
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  // ИЗМЕНЕНИЕ ЗДЕСЬ: Убедимся, что 'data' всегда является массивом.
  // Если 'data' === undefined или null, используем пустой массив []
  const safeData = data || [];

  const filteredData = safeData.filter(item => // <-- Используем safeData
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Appbar.Header style={styles.appBar}>
          <Appbar.BackAction onPress={onClose} color={colors.onPrimary} />
          <Appbar.Content title={title} titleStyle={styles.appBarTitle} />
        </Appbar.Header>

        <Searchbar
          placeholder={searchPlaceholder}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchBarInput}
          theme={{ colors: { primary: colors.primary } }}
        />

        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onSelect(item)}>
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.cardText}>{item.name}</Text>
                  {item.muscleGroup && <Text style={styles.cardSubText}>({item.muscleGroup})</Text>}
                </Card.Content>
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Нет элементов для выбора.</Text>
            </View>
          )}
        />
      </View>
    </Modal>
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
  searchBar: {
    margin: 16,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: colors.surface,
  },
  searchBarInput: {
    minHeight: 40,
  },
  card: {
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: colors.surface,
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  cardSubText: {
    fontSize: 13,
    color: colors.placeholder,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.placeholder,
  },
});

export default PickerModal;