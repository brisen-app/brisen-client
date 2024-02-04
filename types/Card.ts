import SupabaseEntity from "./SupabaseEntity";
import UUID from "./uuid"

export default class Card extends SupabaseEntity {
    protected static readonly tableName: string = "cards"
    get id() { return super.id as UUID }
    get header() { return this.data.header as string | null }
    get content() { return this.data.content as string }
}