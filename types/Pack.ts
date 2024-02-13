import SupabaseEntity from "./SupabaseEntity";
import { NotFoundError } from "./Errors";
import Localization from "./Localization";

export default class Pack extends SupabaseEntity {
    static readonly tableName: string = "packs"
    get id() { return super.id as string }
    get icon() { return this.data.icon as string }

    async fetchTitle() {
        return await Localization.get(`${this.id}_title`)
    }
}