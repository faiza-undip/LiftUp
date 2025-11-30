import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const user = session?.user;

  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState(""); // YYYY-MM-DD
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Rotation animation for loading spinner
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (uploading) {
      // Start continuous rotation animation
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // Reset rotation
      spinValue.setValue(0);
    }
  }, [uploading]);

  async function loadProfile() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, gender, birth_date, height_cm, weight_kg, avatar_url")
      .eq("id", user!.id)
      .maybeSingle();

    if (error) {
      console.log("Profile load error", error);
      Alert.alert("Error", "Failed to load profile.");
    } else if (data) {
      setFullName(data.full_name ?? "");
      setGender(data.gender ?? "");
      setBirthDate(data.birth_date ?? "");
      setHeightCm(data.height_cm?.toString() ?? "");
      setWeightKg(data.weight_kg?.toString() ?? "");
      setAvatarUrl(data.avatar_url ?? null);
    }

    setLoading(false);
  }

  async function saveProfile() {
    if (!user) return;

    if (!gender || !birthDate || !heightCm || !weightKg) {
      Alert.alert(
        "Incomplete",
        "Gender, birth date, height, and weight cannot be empty."
      );
      return;
    }

    const payload = {
      id: user.id,
      full_name: fullName || null,
      gender,
      birth_date: birthDate,
      height_cm: Number(heightCm),
      weight_kg: Number(weightKg),
      avatar_url: avatarUrl,
    };

    const { error } = await supabase.from("profiles").upsert(payload);

    if (error) {
      console.log("Profile save error", error);
      Alert.alert("Error", "Failed to save profile.");
    } else {
      Alert.alert("Saved", "Your profile has been updated.");
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", "Failed to log out.");
    }
  }

  async function pickAvatar() {
    if (!user) return;

    // Ask permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need access to your photos to set a profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
      base64: true, // Get base64 data
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset.uri || !asset.base64) return;

    setUploading(true);

    try {
      const fileExt = (asset.fileName?.split(".").pop() || "jpg").toLowerCase();
      const filePath = `${user.id}.${fileExt}`;

      // Decode base64 to binary
      const base64Data = asset.base64;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, bytes.buffer, {
          contentType: asset.mimeType || "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.log("Upload error:", uploadError);
        Alert.alert("Upload error", uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Add timestamp to bust cache
      const publicUrl = `${publicUrlData.publicUrl}?t=${new Date().getTime()}`;

      setAvatarUrl(publicUrl);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq("id", user.id);

      if (profileError) {
        console.log("Profile update error:", profileError);
        Alert.alert("Error", "Avatar uploaded but failed to save profile.");
      } else {
        Alert.alert("Success", "Profile picture updated!");
      }
    } catch (err: any) {
      console.log("Catch error:", err);
      Alert.alert("Error", "Failed to upload avatar: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                onError={(error) => {
                  console.log("Image load error:", error.nativeEvent.error);
                }}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {user?.email?.[0]?.toUpperCase() || "?"}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.editButton}
              onPress={pickAvatar}
              disabled={uploading}
            >
              {uploading ? (
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: spinValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
                        }),
                      },
                    ],
                  }}
                >
                  <Ionicons name="sync-outline" size={20} color="white" />
                </Animated.View>
              ) : (
                <Ionicons name="pencil" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loading}>Loading...</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.readonlyBox}>
                <Text style={styles.readonlyText}>{user?.email}</Text>
              </View>
              <Text style={styles.helperText}>
                Your email address is permanent and cannot be changed
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor="#bdbbbb"
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={styles.label}>Gender</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Male / Female"
                placeholderTextColor="#bdbbbb"
                value={gender}
                onChangeText={setGender}
              />

              <Text style={styles.label}>Birth Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#bdbbbb"
                value={birthDate}
                onChangeText={setBirthDate}
              />

              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="e.g. 170"
                placeholderTextColor="#bdbbbb"
                value={heightCm}
                onChangeText={setHeightCm}
              />

              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="e.g. 70"
                placeholderTextColor="#bdbbbb"
                value={weightKg}
                onChangeText={setWeightKg}
              />
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={saveProfile}
              >
                <Text style={styles.primaryButtonText}>Save Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050814",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#050814",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "white",
    fontSize: 28,
    fontFamily: "Quicksand_700Bold",
    flex: 1,
    textAlign: "center",
    marginRight: 32, // Offset back button width to truly center
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loading: {
    color: "#bdbbbb",
    fontFamily: "Quicksand_400Regular",
    fontSize: 16,
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1A2332",
    borderWidth: 3,
    borderColor: "#007bff",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#bdbbbb",
    fontSize: 48,
    fontFamily: "Quicksand_700Bold",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#050814",
  },
  section: {
    marginBottom: 24,
  },
  label: {
    color: "white",
    marginBottom: 8,
    fontSize: 14,
    fontFamily: "Quicksand_500Medium",
  },
  input: {
    backgroundColor: "#111827",
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontFamily: "Quicksand_400Regular",
    fontSize: 16,
  },
  readonlyBox: {
    backgroundColor: "#1A2332",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  readonlyText: {
    color: "#bdbbbb",
    fontFamily: "Quicksand_400Regular",
    fontSize: 16,
  },
  buttonGroup: {
    marginTop: 8,
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontFamily: "Quicksand_600SemiBold",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#EF4444",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#FCA5A5",
    fontFamily: "Quicksand_600SemiBold",
    fontSize: 16,
  },
  helperText: {
    color: "#6B7280",
    fontFamily: "Quicksand_400Regular",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 16,
  },
});
