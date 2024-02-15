import SupabaseEntity from "./SupabaseEntity";
import Localization from "./Localization";

export default class Pack extends SupabaseEntity {
    static readonly tableName: string = "packs"

    // get icon() { return this.data.icon as string }

    // async fetchTitle() {
    //     return await Localization.get(`${this.id}_title`)
    // }

    static async fetchAll<T extends typeof SupabaseEntity>(this: T, select: string | null = null): Promise<InstanceType<T>[]> {
        console.debug(`Pack specific fetchAll`);
        return super.fetchAll(this, '*, cards(id)') as Promise<InstanceType<T>[]>;
    }
}