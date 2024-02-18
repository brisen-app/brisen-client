import SupabaseEntity from "./SupabaseEntity";
import { Database } from "./supabase";
import Category from "./Category";
import UUID from "./uuid"
import { NotFoundError } from "./Errors";

type CardData = Database['public']['Tables']['cards']['Row']

export default class Card extends SupabaseEntity {
    static readonly tableName: string = "cards"
    protected readonly data: CardData

    constructor(data: CardData) {
        super(data)
        this.data = data
    }

    public toString(): string {
        return `Card(${this.id})`
    }

    get id() { return super.id as UUID }
    // private get header() { return this.data.header as string | null }
    get content() { return this.data.content as string }
    get category() { return this.data.category as string | null }

    // async fetchCategory() {
    //     if (!this.data.category) throw new NotFoundError(`Card '${this.id}' has no category.`);
    //     return await Category.fetch(this.data.category)
    // }
}