import SupabaseEntity from "./SupabaseEntity";
import Localization from "./Localization";
import Color from "./Color";
import { Database } from "./supabase";
import UUID from "./uuid";

type CategoryData = Database['public']['Tables']['categories']['Row']

export default class Category extends SupabaseEntity {
    static readonly tableName: string = "categories"
        protected readonly data: CategoryData

    constructor(data: CategoryData) {
        super(data)
        this.data = data
    }

    get id() { return super.id as UUID }
    get icon() { return this.data.icon as string }
    get color() { return this.data.color ? Color.hex(this.data.color) : null }

    // async fetchTitle() {
    //     return await Localization.get(`${this.id}_title`)
    // }
}