import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions, Text, Animated } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./home";
import Pets from "./pets";
import Appointments from "./appointments";
import AddPet from "../addPet";
import Accounts from "./accounts";
import Icon from "react-native-vector-icons/Ionicons";
import Octicons from "react-native-vector-icons/Octicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { SIZES, COLORS } from "../../theme/color";

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

// Custom TabBar component with special center add button
function CustomTabBar({
  state,
  descriptors,
  navigation
}: {
  state: any;
  descriptors: any;
  navigation: any;
}) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleOverlay = () => {
    const newValue = !showOverlay;
    setShowOverlay(newValue);

    Animated.timing(animation, {
      toValue: newValue ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Interpolate animation for overlay
  const overlayTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  return (
    <View>
      {/* Overlay Menu */}
      <Animated.View
        style={[
          styles.overlay,
          {
            transform: [{ translateY: overlayTranslateY }],
            opacity: animation,
            display: showOverlay ? 'flex' : 'none'
          }
        ]}
      >
        <View style={styles.overlayContent}>
          <TouchableOpacity style={styles.button} onPress={() => { toggleOverlay(); navigation.navigate('AddPet'); }}>
            <Icon style={styles.overlayItem} name="paw-outline" size={30} color={COLORS.background.mint} />
            <Text style={styles.overlayText}>Pet</Text>
          </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => { toggleOverlay(); navigation.navigate('AddLog'); }}>
              <Icon style={styles.overlayItem} name="document-outline" size={30} color={COLORS.background.mint} />
            <Text style={styles.overlayText}>Diary</Text>
          </TouchableOpacity>


          <TouchableOpacity style={styles.button} onPress={() => { toggleOverlay(); navigation.navigate('AddAppointment'); }}>
            <FontAwesome style={styles.overlayItem} name="calendar-plus-o" size={30} color={COLORS.background.mint} />
            <Text style={styles.overlayText}>Appointment</Text>
          </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => { toggleOverlay(); navigation.navigate('AddSchedule'); }}>
            <MaterialIcons style={styles.overlayItem} name="schedule" size={30} color={COLORS.background.mint} />
            <Text style={styles.overlayText}>Schedule</Text>
            </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBarContainer}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('Home')}
        >
          <AntDesign
            name="home"
            size={SIZES.icon.medium}
            color={state.index === 0 ? COLORS.button.choose : COLORS.button.default}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('Pets')}
        >
          <Icon
            name="paw-outline"
            size={SIZES.icon.medium}
            color={state.index === 1 ? COLORS.button.choose : COLORS.button.default}
          />
        </TouchableOpacity>

        {/* Add Button - inline with other tabs */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={toggleOverlay}
        >
          <View style={styles.addButton}>
            <FontAwesome6 name="plus" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('ProductList')}
        >
          <FontAwesome
            name="shopping-cart"
            size={SIZES.icon.medium}
            color={state.index === 3 ? COLORS.button.choose : COLORS.button.default}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('Accounts')}
        >
          <Octicons
            name="person"
            size={SIZES.icon.medium}
            color={state.index === 4 ? COLORS.button.choose : COLORS.button.default}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const Layout = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Pets"
        component={Pets}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="paw" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Add"
        component={Pets} // This could be any component, as it won't be visible
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="plus" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={Appointments}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="calendar" size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Accounts"
        component={Accounts}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="user" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingTop: 18,
    paddingBottom: 20,
    // height: 60,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    // padding: 5,
    width: 30,
    height: 30,
    borderRadius: 50,
    backgroundColor: "#4FD1C5", // Teal color
    justifyContent: "center",
    alignItems: "center",
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
  },
  overlay: {
    position: 'absolute',
    bottom: 70, // Position just above tab bar
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  overlayContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 18,
    paddingBottom: 10,
    paddingHorizontal: 30,
    backgroundColor: COLORS.background.mint,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  overlayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: COLORS.background.white,
  },
  overlayText: {
    marginTop: 10,
    fontSize: 14,
    color: 'white',
    alignSelf: 'center',
    textAlign: 'center',
    fontWeight: 600,
    fontFamily: 'Poppins-Bold',

  },
  button: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default Layout;