import { StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { memo } from 'react'

const ImageView = ({ uri, width }) => {
    return (
        <Image
            source={{ uri: uri }}
            decodeFormat="rgb"
            style={{ width, height: '100%' }}
            contentFit="contain"
            autoplay={true}
            transition={200}
            cachePolicy={'memory-disk'}
        />
    )
}

export default memo(ImageView)

const styles = StyleSheet.create({})