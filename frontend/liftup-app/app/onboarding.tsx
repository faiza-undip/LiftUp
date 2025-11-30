import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { RulerPicker } from "react-native-ruler-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";

import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";

export default function OnboardingScreen({ navigation }: any) {
  const router = useRouter();
  const { session } = useAuth();

  const userId = session?.user.id;

  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(70);
  const [loading, setLoading] = useState(true);

  // Dropdown state
  const [genderOpen, setGenderOpen] = useState(false);
  const [genderItems, setGenderItems] = useState([
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (data) {
        // already onboarded → go to app
        router.replace("/(tabs)");
      } else {
        setLoading(false);
      }
    })();
  }, [userId]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const onSave = async () => {
    if (!gender) {
      return Alert.alert(
        "Incomplete",
        "Please fill all fields. This step cannot be skipped."
      );
    }

    const birthDateString = birthDate.toISOString().split("T")[0];

    const { error } = await supabase.from("profiles").insert({
      id: userId,
      gender,
      birth_date: birthDateString,
      height_cm: Math.round(heightCm),
      weight_kg: Math.round(weightKg),
    });
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      router.replace("/(tabs)");
    }
  };

  if (loading)
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!genderOpen}
      >
        <Text style={styles.title}>Tell us about you</Text>

        {/* Gender Dropdown */}
        <View style={[styles.fieldContainer, { zIndex: 3000 }]}>
          <Text style={styles.label}>Gender</Text>
          <DropDownPicker
            open={genderOpen}
            value={gender}
            items={genderItems}
            setOpen={setGenderOpen}
            setValue={setGender}
            setItems={setGenderItems}
            placeholder="Select your gender"
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            dropDownContainerStyle={styles.dropdownContainer}
            placeholderStyle={styles.placeholderStyle}
            listItemContainerStyle={styles.listItemContainer}
            selectedItemContainerStyle={styles.selectedItemContainer}
            theme="DARK"
            zIndex={3000}
            zIndexInverse={1000}
            listMode="SCROLLVIEW"
          />
        </View>

        {/* Birth Date Picker */}
        <View style={[styles.fieldContainer, { zIndex: 2000 }]}>
          <Text style={styles.label}>Birth Date</Text>
          <Pressable
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(birthDate)}</Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              maximumDate={new Date()}
              textColor="white"
              themeVariant="dark"
            />
          )}
        </View>

        {/* Height Picker */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Height: {Math.round(heightCm)} cm</Text>
          <View style={styles.pickerWrapper}>
            <RulerPicker
              min={100}
              max={250}
              step={1}
              fractionDigits={0}
              initialValue={heightCm}
              onValueChange={(value) => setHeightCm(Number(value))}
              unit="cm"
              indicatorColor="#007bff"
              valueTextStyle={styles.rulerValue}
              unitTextStyle={styles.rulerUnit}
              shortStepColor="#555"
              longStepColor="#888"
              shortStepHeight={15}
              longStepHeight={30}
              width={300}
              height={80}
            />
          </View>
        </View>

        {/* Weight Picker */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Weight: {Math.round(weightKg)} kg</Text>
          <View style={styles.pickerWrapper}>
            <RulerPicker
              min={30}
              max={200}
              step={1}
              fractionDigits={0}
              initialValue={weightKg}
              onValueChange={(value) => setWeightKg(Number(value))}
              unit="kg"
              indicatorColor="#007bff"
              valueTextStyle={styles.rulerValue}
              unitTextStyle={styles.rulerUnit}
              shortStepColor="#555"
              longStepColor="#888"
              shortStepHeight={15}
              longStepHeight={30}
              width={300}
              height={80}
            />
          </View>
        </View>

        <Pressable style={styles.buttonContainer} onPress={onSave}>
          <Text style={styles.button}>Continue</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050814",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    color: "white",
    fontSize: 24,
    marginBottom: 32,
    fontFamily: "Quicksand_600SemiBold",
  },
  loadingText: {
    color: "white",
    fontFamily: "Quicksand_400Regular",
  },
  fieldContainer: {
    marginBottom: 32,
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 12,
    fontFamily: "Quicksand_600SemiBold",
  },
  dropdown: {
    backgroundColor: "#111827",
    borderColor: "#111827",
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownText: {
    color: "white",
    fontFamily: "Quicksand_400Regular",
    fontSize: 14,
  },
  dropdownContainer: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  placeholderStyle: {
    color: "#bdbbbb",
    fontFamily: "Quicksand_400Regular",
  },
  listItemContainer: {
    backgroundColor: "#111827",
  },
  selectedItemContainer: {
    backgroundColor: "#1e293b",
  },
  dateButton: {
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 8,
  },
  dateText: {
    color: "white",
    fontFamily: "Quicksand_400Regular",
    fontSize: 14,
  },
  pickerWrapper: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  rulerValue: {
    color: "white",
    fontFamily: "Quicksand_600SemiBold",
    fontSize: 20,
  },
  rulerUnit: {
    color: "#999",
    fontFamily: "Quicksand_400Regular",
    fontSize: 14,
  },
  buttonContainer: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  button: {
    fontFamily: "Quicksand_600SemiBold",
    color: "white",
    fontSize: 16,
  },
});