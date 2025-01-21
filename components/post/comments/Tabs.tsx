import { View, Text, LayoutChangeEvent } from 'react-native'
import React, { Dispatch, FC, SetStateAction } from 'react'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler'
import ButtonTab from './ButtonTab'

interface TabsProps {
    titleVisible?: boolean
    tabsVisible?: boolean
    active: string
    setActive: Dispatch<SetStateAction<string>>
    onTitlePress?: () => void
    onLayout?: (event: LayoutChangeEvent) => void
}

const Tabs: FC<TabsProps> = ({
    titleVisible = true,
    tabsVisible = true,
    active,
    setActive,
    onTitlePress,
    onLayout
}: TabsProps) => {
    return (
        <View className='flex-row gap-3 bg-grayscale-lighter_1x/[.93] p-3 rounded-2xl' onLayout={onLayout}>
            {
                titleVisible && <TouchableOpacity onPress={onTitlePress}>
                    <Text className='self-center text-2xl font-semibold text-gray-400'>Comments</Text>
                </TouchableOpacity>
            }
            {
                tabsVisible && <FlatList
                    data={['🔥 Top', '🕑 Recents', '😄 Friends', '👑 VIPs']}
                    showsHorizontalScrollIndicator={false}
                    horizontal
                    className='rounded-xl'
                    contentContainerClassName='gap-1'
                    renderItem={({ item, index }) => (
                        <ButtonTab
                            index={index}
                            label={item}
                            isActive={active === item}
                            onPress={() => setActive(item)}
                        />
                    )}
                />
            }
        </View>
    )
}

export default Tabs