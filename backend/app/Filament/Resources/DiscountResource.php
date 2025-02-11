<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DiscountResource\Pages;
use App\Filament\Resources\DiscountResource\RelationManagers;
use App\Models\Discount;
use Filament\Forms;
use Filament\Forms\Components\Group;
use Filament\Forms\Components\Section;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Support\RawJs;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class DiscountResource extends Resource
{
    protected static ?string $model = Discount::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Informasi Diskon')
                    ->schema([
                        Forms\Components\TextInput::make('code')
                            ->label('Kode Diskon')
                            ->placeholder('Masukkan Kode Diskon')
                            ->columnSpanFull()
                            ->minLength(10)
                            ->maxLength(10)
                            ->helperText('Kode Diskon harus terdiri dari 10 karakter.')
                            ->required(),
                        Group::make([
                            Forms\Components\Select::make('type')
                                ->label('Jenis Diskon')
                                ->placeholder('Pilih Jenis Diskon')
                                ->options([
                                    0 => 'Persen (%)',
                                    1 => 'Nominal (.00)',
                                ])
                                ->native(false)
                                ->preload()
                                ->searchable()
                                ->live()
                                ->columnSpan(fn(Get $get, ?Model $record) => ($get('type') === '0' || ($record && $record->type === 0)) ? 4 : 2)
                                ->required(),
                            Forms\Components\TextInput::make('value')
                                ->label('Nilai Diskon')
                                ->placeholder(fn(Get $get, ?Model $record) => ($get('type') === '0' || ($record && $record->type === 0)) ? 'Persen (%)' : 'Masukkan Nominal Diskon')
                                ->mask(fn(Get $get, ?Model $record) => ($get('type') === '1' || ($record && $record->type === 1)) ? RawJs::make('$money($input)') : null)
                                ->stripCharacters(fn(Get $get, ?Model $record) => ($get('type') === '1' || ($record && $record->type === 1)) ? ',' : null)
                                ->minLength(fn(Get $get, ?Model $record) => ($get('type') === '0' || ($record && $record->type === 0)) ? 1 : 5)
                                ->maxLength(fn(Get $get, ?Model $record) => ($get('type') === '0' || ($record && $record->type === 0)) ? 3 : 8)
                                ->minValue(fn(Get $get, ?Model $record) => ($get('type') === '0' || ($record && $record->type === 0)) ? 1 : 1000)
                                ->maxValue(fn(Get $get, ?Model $record) => ($get('type') === '0' || ($record && $record->type === 0)) ? 100 : 9999999)
                                ->prefix(fn(Get $get, ?Model $record) => ($get('type') === '0' || ($record && $record->type === 0)) ? '' : 'Rp')
                                ->suffix(fn(Get $get, ?Model $record) => ($get('type') === '0' || ($record && $record->type === 0)) ? '%' : '.00')
                                ->live(onBlur: true)
                                ->afterStateUpdated(function ($state, callable $set, callable $get) {
                                    if ($get('type') === '1') {
                                        $set('max_order_value', $state); // Set max_order_value sama dengan value
                                    }
                                })
                                ->numeric()
                                ->columnSpan(fn(Get $get, ?Model $record) => ($get('type') === '0' || ($record && $record->type === 0)) ? 2 : 4)
                                ->required(),
                        ])->columns(6)
                            ->columnSpan(2),
                        Forms\Components\Textarea::make('description')
                            ->label('Deskripsi Diskon')
                            ->placeholder('Masukkan Deskripsi Diskon')
                            ->minLength(3)
                            ->rows(3)
                            ->hint('Sesuaikan dengan Jenis & Minimal Pembelian')
                            ->helperText('Contoh: Diskon 20% hingga Rp 500.000 Min. Pembelian 2 JT Rupiah')
                            ->autosize()
                            ->required()
                            ->columnSpanFull(),
                    ])->columns(2)
                    ->columnSpan(1),
                Group::make([
                    Section::make('Kondisi & Periode Diskon')
                        ->schema([
                            Forms\Components\TextInput::make('min_order_value')
                                ->label('Minimal Pembelian')
                                ->placeholder('Minimal Pembelian')
                                ->mask(RawJs::make('$money($input)'))
                                ->stripCharacters(',')
                                ->prefix('Rp')
                                ->suffix('.00')
                                ->minLength(5)
                                ->maxLength(8)
                                ->minValue(1000)
                                ->maxValue(9999999)
                                ->numeric()
                                ->required(),
                            Forms\Components\TextInput::make('max_order_value')
                                ->label('Maksimal Nilai Diskon')
                                ->placeholder('Maksimal Diskon')
                                ->mask(RawJs::make('$money($input)'))
                                ->stripCharacters(',')
                                ->prefix('Rp')
                                ->suffix('.00')
                                ->minLength(5)
                                ->maxLength(8)
                                ->minValue(1000)
                                ->maxValue(9999999)
                                ->stripCharacters(',')
                                ->hint(fn(Get $get, ?Model $record) => ($get('type') === '1' || ($record && $record->type === 1)) ? 'Otomatis' : null)
                                ->disabled(fn(Get $get, ?Model $record) => ($get('type') === '1' || ($record && $record->type === 1)))
                                ->dehydrated(fn(Get $get, ?Model $record) => ($get('type') === '1' || ($record && $record->type === 1)))
                                ->numeric()
                                ->default(null)
                                ->required(),
                            Forms\Components\DateTimePicker::make('start_date')
                                ->label('Waktu Mulai Diskon')
                                ->placeholder('Pilih Waktu Mulai Diskon')
                                ->native(false)
                                ->required(),
                            Forms\Components\DateTimePicker::make('end_date')
                                ->label('Waktu Selesai Diskon')
                                ->placeholder('Pilih Waktu Selesai Diskon')
                                ->native(false)
                                ->required(),
                        ])->columns(2)
                        ->columnSpan(3),
                    Section::make('')
                        ->schema([
                            Forms\Components\Toggle::make('is_active')
                                ->label('Status Diskon')
                                ->inline()
                                ->offIcon('heroicon-m-gift')
                                ->onIcon('heroicon-m-rocket-launch')
                                ->required(),
                        ])->columnSpan(1),
                ])->columns(3)
            ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('code')
                    ->searchable(),
                Tables\Columns\TextColumn::make('type')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('value')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('min_order_value')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('max_order_value')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('start_date')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('end_date')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_active')
                    ->boolean(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDiscounts::route('/'),
            'create' => Pages\CreateDiscount::route('/create'),
            'view' => Pages\ViewDiscount::route('/{record}'),
            'edit' => Pages\EditDiscount::route('/{record}/edit'),
        ];
    }
}
