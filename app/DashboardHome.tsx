import { View, Text, StyleSheet } from "react-native";

export function DashBoardHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome john doe</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
});
