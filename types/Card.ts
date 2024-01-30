import { SupabaseEntity } from "./SupabaseEntity";
import { UUID } from "./uuid"

export class Card extends SupabaseEntity {
    protected static readonly tableName: string = "cards"
    get id() { return super.id as UUID }
    get content() { return this.data.content }
}