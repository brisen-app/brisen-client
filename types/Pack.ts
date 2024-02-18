import SupabaseEntity from "./SupabaseEntity";
import Localization from "./Localization";
import UUID from "./uuid";

export default class Pack extends SupabaseEntity {
    static readonly tableName: string = "packs"

    // get icon() { return this.data.icon as string }
    get cards() { return this.data.cards.map((c: any) => c.id) as UUID[]}
    get category() { return this.data.category as string | null }

    // async fetchTitle() {
    //     return await Localization.get(`${this.id}_title`)
    // }

    static async fetchAll<T extends typeof SupabaseEntity>(this: T, select: string | null = null): Promise<InstanceType<T>[]> {
        console.debug(`Pack specific fetchAll`);
        return super.fetchAll(this, '*, cards(id)') as Promise<InstanceType<T>[]>;
    }
}