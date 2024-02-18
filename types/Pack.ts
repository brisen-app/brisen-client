import SupabaseEntity from "./SupabaseEntity";
import UUID from "./uuid";
import { Database } from "./supabase";

type PackData = Database['public']['Tables']['packs']['Row']

export default class Pack extends SupabaseEntity {
    static readonly tableName: string = "packs"
    protected readonly data: PackData

    constructor(data: PackData) {
        super(data)
        this.data = data
    }

    // get icon() { return this.data.icon as string }
    get name() { return this.data.name as string }
    get description() { return this.data.description as string | null }
    get cards() { return this.data.cards.map((c: any) => c.id) as UUID[]}

    // async fetchTitle() {
    //     return await Localization.get(`${this.id}_title`)
    // }

    static async fetchAll<T extends typeof SupabaseEntity>(this: T, select: string | null = null): Promise<InstanceType<T>[]> {
        console.debug(`Pack specific fetchAll`);
        return super.fetchAll(this, '*, cards(id)') as Promise<InstanceType<T>[]>;
    }
}