<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ClearUserAccounts extends Command
{
    protected $signature = 'users:clear {--force : No confirmation prompt}';

    protected $description = 'Delete all user accounts (cascades app data), Sanctum tokens, and password reset tokens';

    public function handle(): int
    {
        if (! $this->option('force')) {
            if (! $this->confirm('Dzēst VISUS lietotājus un to datus? Šo nevar atsaukt.')) {
                return self::FAILURE;
            }
        }

        if (Schema::hasTable('personal_access_tokens')) {
            DB::table('personal_access_tokens')
                ->where('tokenable_type', User::class)
                ->delete();
        }

        if (Schema::hasTable('password_reset_tokens')) {
            DB::table('password_reset_tokens')->delete();
        }

        $count = User::query()->delete();

        $this->info("Izdzēsti lietotāji: {$count}.");

        return self::SUCCESS;
    }
}
