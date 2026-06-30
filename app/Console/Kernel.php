<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Console\Commands\EnviarRecordatorioResena; // <--- IMPORTANTE

class Kernel extends ConsoleKernel
{
    protected $commands = [
        EnviarRecordatorioResena::class,
    ];

    protected function schedule(Schedule $schedule)
    {
        $schedule->command('resenas:recordatorio')->dailyAt('09:00');
    }

    protected function commands()
    {
        $this->load(app_path('Console/Commands'));
    }
}
