import SupabaseEntity from "./SupabaseEntity";
import Localization from "./Localization";
import Color from "./Color";

export default class Category extends SupabaseEntity {
    static readonly tableName: string = "categories"

    get id() { return super.id as string }
    get icon() { return this.data.icon as string }
    get color() { return this.data.color ? Color.hex(this.data.color) : null }

    async fetchTitle() {
        return await Localization.get(`${this.id}_title`)
    }
}