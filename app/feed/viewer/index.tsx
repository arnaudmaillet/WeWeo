import { FC } from "react"
import { useLocalSearchParams } from "expo-router"
import Images from "~/components/post/media/viewer/Images"


const index: FC = () => {
    const { data, active } = useLocalSearchParams<{ data: string, active: string }>()
    return <Images data={JSON.parse(data)} active={Number(active)} />
}

export default index