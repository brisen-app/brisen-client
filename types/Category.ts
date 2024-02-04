import SupabaseEntity from "./SupabaseEntity";
import Localization from "./Localization";

export default class Category extends SupabaseEntity {
    protected static readonly tableName: string = "categories"

    get id() { return super.id as string }
    get icon() { return this.data.icon as string }
    get color() { return this.data.color as string | null }
    get title() { return (async () => {
        return await Localization.get(`${this.id}_title`)
    })()}
}