<?php

namespace App\Filament\Resources\ItemResource\RelationManagers;

use App\Models\ItemTestimonial;
use Filament\Forms;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Actions\ActionGroup;
use Filament\Tables\Actions\BulkActionGroup;
use Filament\Tables\Actions\CreateAction;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\DeleteBulkAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\Summarizers\Average;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Mokhosh\FilamentRating\Columns\RatingColumn;
use Mokhosh\FilamentRating\Components\Rating;
use Mokhosh\FilamentRating\RatingTheme;

class ItemTestimonialsRelationManager extends RelationManager
{
    protected static string $relationship = 'itemTestimonials';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                TextInput::make('name')
                    ->label('Nama Pembeli')
                    ->placeholder('Masukkan Nama Pembeli')
                    ->minLength(3)
                    ->maxLength(45)
                    ->required(),

                Rating::make('rating')
                    ->label('Penilaian Barang')
                    ->theme(RatingTheme::HalfStars)
                    ->default(1)
                    ->size('xl')
                    ->color('warning')
                    ->required(),

                FileUpload::make('photo')
                    ->label('Foto Profil')
                    ->image()
                    ->imageEditor()
                    ->imageEditorAspectRatios([
                        '1:1',
                    ])
                    ->imageCropAspectRatio('1:1')
                    ->directory('thumbnail')
                    ->visibility('public')
                    ->helperText('Format yang didukung: JPG, PNG, atau GIF.')
                    ->required(),

                Textarea::make('message')
                    ->label('Pesan')
                    ->placeholder('Masukkan Pesan')
                    ->minLength(10)
                    ->rows(5)
                    ->autosize()
                    ->required(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->heading('Testimoni Barang')
            ->recordTitleAttribute('name')
            ->columns([
                TextColumn::make('name')
                    ->label('Pembeli')
                    ->formatStateUsing(function (ItemTestimonial $record) {
                        $nameParts = explode(' ', trim($record->name));
                        $initials = isset($nameParts[1])
                            ? strtoupper(substr($nameParts[0], 0, 1) . substr($nameParts[1], 0, 1))
                            : strtoupper(substr($nameParts[0], 0, 1));
                        $photo = $record->photo
                            ? asset('storage/' . $record->photo)
                            : 'https://ui-avatars.com/api/?name=' . $initials . '&amp;color=FFFFFF&amp;background=030712';
                        $image = '<img class="w-10 h-10 rounded-lg" style="margin-right: 0.625rem !important;" src="' . $photo . '" alt="Avatar User">';
                        $nama = '<div class="text-sm font-medium text-gray-800">' . e($record->name) . '</div>';
                        return '<div class="flex items-center" style="margin-right: 4rem !important">'
                            . $image
                            . '<div>' . $nama . '</div></div>';
                    })
                    ->html(),
                TextColumn::make('message')
                    ->label('Pesan')
                    ->limit(50),
                RatingColumn::make('rating')
                    ->label('Penilaian')
                    ->theme(RatingTheme::HalfStars)
                    ->summarize([
                        Average::make()
                            ->label('Rata-Rata Penilaian')
                    ])
                    ->color('warning'),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                CreateAction::make()
                    ->label('Tambah Testimoni'),
            ])
            ->actions([
                ActionGroup::make([
                    EditAction::make(),
                    DeleteAction::make(),
                ])
                    ->icon('heroicon-o-ellipsis-horizontal-circle')
                    ->color('info')
                    ->tooltip('Aksi')
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
