import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import TabButton from './tabbtn';
import { COLORS } from '../theme/color';
import AvaBtn from './avabtn';
import { Pet } from '../models/models';

type TabType = 'pets' | 'appointments';

interface TabBarProps {
    type: TabType;
    initialTab: string;
    onTabChange: (tab: string) => void;
    pets?: Pet[];
    isLoading?: boolean;
    selectedAvatars?: string[];
    onAvatarChange?: (avatars: string[]) => void;
}

const TabBar: React.FC<TabBarProps> = ({ 
    type, 
    initialTab = 'PROFILE', 
    onTabChange, 
    pets, 
    isLoading,
    selectedAvatars = ['all'],
    onAvatarChange
}) => {
    const [chosenTab, setChosenTab] = useState<string>(initialTab);

    const handleTabPress = (tabName: string) => {
        setChosenTab(tabName);
        onTabChange(tabName);
    };

    const handleAvatarPress = (avatarId: string) => {
        if (!onAvatarChange) return;
        
        let newSelection = [...(selectedAvatars || [])];
        
        // If clicking 'all'
        if (avatarId === 'all') {
            // Only allow deselecting 'all' if other avatars are selected
            if (selectedAvatars?.includes('all') && selectedAvatars.length === 1) {
                onAvatarChange(['all']); // Keep 'all' selected if it's the only one
                return;
            }
            onAvatarChange(['all']); // Select only 'all'
            return;
        }
        
        // If clicking other avatars
        if (selectedAvatars?.includes(avatarId)) {
            // Remove the clicked avatar
            newSelection = newSelection.filter(id => id !== avatarId);
            // If no avatars left selected, select 'all'
            if (newSelection.length === 0) {
                onAvatarChange(['all']);
                return;
            }
            onAvatarChange(newSelection);
        } else {
            // Add new selection and remove 'all'
            newSelection = newSelection.filter(id => id !== 'all');
            newSelection.push(avatarId);
            onAvatarChange(newSelection);
        }
    };

    const getButtonVariant = (buttonId: string) => {
        if (chosenTab === buttonId) return 'choose';
        return 'default';
    };

    const renderPetsTabs = () => (
        <>
            <TabButton
                tabName="PROFILE"
                variant={getButtonVariant('PROFILE')}
                onPress={() => handleTabPress('PROFILE')}
            />
            <TabButton
                tabName="DIARY"
                variant={getButtonVariant('DIARY')}
                onPress={() => handleTabPress('DIARY')}
            />
            <TabButton
                tabName="SCHEDULE"
                variant={getButtonVariant('SCHEDULE')}
                onPress={() => handleTabPress('SCHEDULE')}
            />
            <TabButton
                tabName="APPOINTMENT"
                variant={getButtonVariant('APPOINTMENT')}
                onPress={() => handleTabPress('APPOINTMENT')}
            />
        </>
    );

    const renderAppointmentTabs = () => (
        <>
            <TabButton
                tabName="UPCOMING"
                variant={getButtonVariant('UPCOMING')}
                onPress={() => handleTabPress('UPCOMING')}
            />
            <TabButton
                tabName="PAST"
                variant={getButtonVariant('PAST')}
                onPress={() => handleTabPress('PAST')}
            />
            <TabButton
                tabName="CANCELLED"
                variant={getButtonVariant('CANCELLED')}
                onPress={() => handleTabPress('CANCELLED')}
            />
        </>
    );

    return (
        <View style={styles.container}>
            <ScrollView horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={styles.avaContainer}>
                <AvaBtn 
                    variant="all" 
                    isChosen={selectedAvatars?.includes('all')}
                    onPress={() => handleAvatarPress('all')} 
                />
                {isLoading ? (
                    <ActivityIndicator size="small" color={COLORS.background.mint} />
                ) : pets && pets.length > 0 ? (
                    pets.map((pet) => (
                        <AvaBtn 
                            key={pet.petid}
                            variant="default"
                            petName={pet.name}
                            imageUrl={pet.data_image ? `data:image/jpeg;base64,${pet.data_image}` : ''}
                            isChosen={selectedAvatars?.includes(pet.petid || '')}
                            onPress={() => handleAvatarPress(pet.petid || '')}
                        />
                    ))
                ) : null}
            </ScrollView>
            <View style={styles.tabContainer}>
                {type === 'pets' ? renderPetsTabs() : renderAppointmentTabs()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    tabContainer: {
        display: 'flex',
        paddingHorizontal: 20,
        paddingVertical: 0,
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch',
        flexDirection: 'row',
    },
    avaContainer: {
        paddingTop: 10,
        display: 'flex',
        // justifyContent: 'center',
        alignItems: 'flex-start',
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 0,
        gap: 15,
        alignSelf: 'stretch',
    },
    scrollView: {
        flexGrow: 0,
    },
    // avaContainer: {
    //     paddingTop: 10,
    //     paddingHorizontal: 20,
    //     paddingVertical: 0,
    //     gap: 15,
    //     flexDirection: 'row',
    //     alignItems: 'flex-start',
    // },
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        alignSelf: 'stretch',
        gap: 5,
        backgroundColor: COLORS.background.white,
    }
})
export default TabBar;