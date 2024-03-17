import { Tables } from '@/types/supabase';
import { SupabaseEntityManager } from './supabase';


export type Card = Tables<'cards'>;

export abstract class CardManager extends SupabaseEntityManager {
    static readonly tableName = 'cards';
}
