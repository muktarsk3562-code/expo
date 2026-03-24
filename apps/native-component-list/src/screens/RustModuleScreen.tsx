import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import HeadingText from '../components/HeadingText';
import MonoText from '../components/MonoText';
import Colors from '../constants/Colors';

let RustMath: any = null;
let RustString: any = null;
let loadError: string | null = null;

try {
  const mod = require('expo-rust-jsi');
  RustMath = mod.RustMath;
  RustString = mod.RustString;
} catch (e: any) {
  loadError = e.message;
}

type ResultEntry = { label: string; value: string; isError?: boolean };

export default function RustModuleScreen() {
  const [results, setResults] = useState<ResultEntry[]>([]);

  const addResult = (label: string, fn: () => any) => {
    try {
      const value = fn();
      if (value instanceof Promise) {
        value
          .then((v: any) =>
            setResults((prev) => [...prev, { label, value: JSON.stringify(v) }])
          )
          .catch((e: any) =>
            setResults((prev) => [...prev, { label, value: e.message, isError: true }])
          );
      } else {
        setResults((prev) => [...prev, { label, value: JSON.stringify(value) }]);
      }
    } catch (e: any) {
      setResults((prev) => [...prev, { label, value: e.message, isError: true }]);
    }
  };

  if (loadError) {
    return (
      <ScrollView style={styles.container}>
        <HeadingText>expo-rust-jsi not available</HeadingText>
        <MonoText containerStyle={styles.errorBox}>{loadError}</MonoText>
        <Text style={styles.hint}>
          This module requires a native build with Rust toolchain. It is not available in Expo
          Go.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Constants */}
      <HeadingText>Constants</HeadingText>
      <View style={styles.row}>
        <MonoText>PI = {String(RustMath?.PI)}</MonoText>
        <MonoText>E = {String(RustMath?.E)}</MonoText>
        <MonoText>TAU = {String(RustMath?.TAU)}</MonoText>
      </View>

      {/* Sync Math */}
      <HeadingText>Sync Math Functions</HeadingText>
      <View style={styles.buttonRow}>
        <Button
          title="add(2, 3)"
          onPress={() => addResult('add(2, 3)', () => RustMath.add(2, 3))}
          style={styles.button}
        />
        <Button
          title="multiply(6, 7)"
          onPress={() => addResult('multiply(6, 7)', () => RustMath.multiply(6, 7))}
          style={styles.button}
        />
        <Button
          title="sqrt(144)"
          onPress={() => addResult('sqrt(144)', () => RustMath.sqrt(144))}
          style={styles.button}
        />
        <Button
          title="fibonacci(10)"
          onPress={() => addResult('fibonacci(10)', () => RustMath.fibonacci(10))}
          style={styles.button}
        />
        <Button
          title="pow(2, 10)"
          onPress={() => addResult('pow(2, 10)', () => RustMath.pow(2, 10))}
          style={styles.button}
        />
        <Button
          title="clamp(15, 0, 10)"
          onPress={() => addResult('clamp(15, 0, 10)', () => RustMath.clamp(15, 0, 10))}
          style={styles.button}
        />
        <Button
          title="sum5(1,2,3,4,5)"
          onPress={() => addResult('sum5(1..5)', () => RustMath.sum5(1, 2, 3, 4, 5))}
          style={styles.button}
        />
      </View>

      {/* Async Math */}
      <HeadingText>Async Math Functions (Promises)</HeadingText>
      <View style={styles.buttonRow}>
        <Button
          title="factorial(10)"
          onPress={() => addResult('factorial(10)', () => RustMath.factorial(10))}
          style={styles.button}
        />
        <Button
          title="is_prime(97)"
          onPress={() => addResult('is_prime(97)', () => RustMath.is_prime(97))}
          style={styles.button}
        />
        <Button
          title="is_prime(100)"
          onPress={() => addResult('is_prime(100)', () => RustMath.is_prime(100))}
          style={styles.button}
        />
      </View>

      {/* String Functions */}
      <HeadingText>String Functions</HeadingText>
      <View style={styles.buttonRow}>
        <Button
          title='to_upper_case("hello")'
          onPress={() =>
            addResult('to_upper_case', () => RustString.to_upper_case('hello'))
          }
          style={styles.button}
        />
        <Button
          title='reverse("expo")'
          onPress={() => addResult('reverse', () => RustString.reverse('expo'))}
          style={styles.button}
        />
        <Button
          title='length("rust")'
          onPress={() => addResult('length', () => RustString.length('rust'))}
          style={styles.button}
        />
        <Button
          title='contains("hello world", "world")'
          onPress={() =>
            addResult('contains', () => RustString.contains('hello world', 'world'))
          }
          style={styles.button}
        />
        <Button
          title='repeat("ab", 3)'
          onPress={() => addResult('repeat', () => RustString.repeat('ab', 3))}
          style={styles.button}
        />
        <Button
          title='simple_hash("test")'
          onPress={() => addResult('simple_hash', () => RustString.simple_hash('test'))}
          style={styles.button}
        />
      </View>

      {/* Record Function */}
      <HeadingText>Record Parameter (format_text)</HeadingText>
      <View style={styles.buttonRow}>
        <Button
          title="format_text({text, uppercase, repeat})"
          onPress={() =>
            addResult('format_text', () =>
              RustString.format_text({
                text: 'rust',
                uppercase: true,
                repeat_count: 3,
                separator: '-',
              })
            )
          }
          style={styles.button}
        />
      </View>

      {/* Results */}
      <HeadingText>Results</HeadingText>
      {results.length === 0 && (
        <Text style={styles.hint}>Tap a button above to see results</Text>
      )}
      {results.map((r, i) => (
        <View key={i} style={styles.resultRow}>
          <Text style={styles.resultLabel}>{r.label}</Text>
          <MonoText containerStyle={r.isError ? styles.errorBox : styles.resultBox}>
            {r.value}
          </MonoText>
        </View>
      ))}

      {results.length > 0 && (
        <Button
          title="Clear Results"
          onPress={() => setResults([])}
          style={styles.clearButton}
        />
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

RustModuleScreen.navigationOptions = {
  title: 'Rust JSI Module',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.greyBackground,
  },
  row: {
    marginVertical: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  button: {
    marginBottom: 4,
  },
  resultRow: {
    marginVertical: 4,
  },
  resultLabel: {
    fontWeight: 'bold',
    fontSize: 12,
    color: Colors.secondaryText,
    marginBottom: 2,
  },
  resultBox: {
    borderColor: Colors.tintColor,
  },
  errorBox: {
    borderColor: 'red',
  },
  hint: {
    color: Colors.secondaryText,
    fontStyle: 'italic',
    marginVertical: 8,
  },
  clearButton: {
    marginTop: 12,
    alignSelf: 'center',
  },
  spacer: {
    height: 40,
  },
});
