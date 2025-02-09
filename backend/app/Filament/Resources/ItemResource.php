<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ItemResource\Pages;
use App\Filament\Resources\ItemResource\RelationManagers;
use App\Filament\Resources\ItemResource\RelationManagers\ItemTestimonialsRelationManager;
use App\Models\Item;
use Filament\Forms;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Group;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Support\RawJs;
use Filament\Tables;
use Filament\Tables\Actions\ActionGroup;
use Filament\Tables\Actions\BulkActionGroup;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\DeleteBulkAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ItemResource extends Resource
{
    protected static ?string $model = Item::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Group::make([
                    Group::make([
                        Section::make('')
                            ->schema([
                                FileUpload::make('thumbnail')
                                    ->label('')
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
                            ]),
                        Section::make('')
                            ->schema([
                                Select::make('category_id')
                                    ->label('Kategori')
                                    ->placeholder('Pilih Kategori')
                                    ->relationship('category', 'name')
                                    ->native(false)
                                    ->preload()
                                    ->searchable()
                                    ->required(),
                                Select::make('brand_id')
                                    ->label('Merek / Brand')
                                    ->placeholder('Pilih Brand')
                                    ->relationship('brand', 'name')
                                    ->native(false)
                                    ->preload()
                                    ->searchable()
                                    ->required(),
                            ])->columns(1),
                    ])->columnSpan(2),

                    Group::make([
                        Section::make('Informasi Barang')
                            ->schema([
                                TextInput::make('name')
                                    ->label('Nama Barang')
                                    ->placeholder('Masukkan Nama Barang')
                                    ->minLength(3)
                                    ->maxLength(100)
                                    ->columnSpanFull()
                                    ->required(),
                                Textarea::make('description')
                                    ->label('Deskripsi Barang')
                                    ->placeholder('Masukkan Deskripsi Barang')
                                    ->minLength(3)
                                    ->rows(5)
                                    ->autosize()
                                    ->columnSpanFull()
                                    ->required(),
                            ])->columns(2),
                        Section::make('')
                            ->schema([
                                Repeater::make('itemSpecifications')
                                    ->label('Spesifikasi Barang')
                                    ->relationship()
                                    ->schema([
                                        Textarea::make('name')
                                            ->label('')
                                            ->placeholder('Masukkan Deskripsi Spesifikasi')
                                            ->minLength(3)
                                            ->maxLength(100)
                                            ->rows(1)
                                            ->autosize(),
                                    ])
                                    ->reorderable(true)
                                    ->reorderableWithButtons()
                                    ->addActionLabel('Tambah Deskripsi Spesifikasi'),
                            ]),
                    ])->columnSpan(3),


                    Group::make([
                        Section::make('Stok & Harga')
                            ->schema([
                                TextInput::make('stock')
                                    ->label('Stok')
                                    ->placeholder('Stok')
                                    ->minLength(1)
                                    ->maxLength(3)
                                    ->minValue(0)
                                    ->maxValue(999)
                                    ->step(1)
                                    ->numeric()
                                    ->prefix('Qty')
                                    ->default(0)
                                    ->columnSpan(2)
                                    ->required(),
                                TextInput::make('price')
                                    ->label('Harga')
                                    ->placeholder('Masukkan Harga')
                                    ->numeric()
                                    ->step(50000)
                                    ->minLength(4)
                                    ->maxLength(11)
                                    ->minValue(0000)
                                    ->maxValue(999999999)
                                    ->mask(RawJs::make('$money($input)'))
                                    ->stripCharacters(',')
                                    ->prefix('Rp')
                                    ->suffix('.00')
                                    ->columnSpan(4)
                                    ->required(),
                            ])->columns(6),
                        Section::make('Visibilitas & Status')
                            ->schema([
                                Toggle::make('is_displayed')
                                    ->label('Tampilkan Barang')
                                    ->inline(false)
                                    ->offIcon('heroicon-m-cube')
                                    ->onIcon('heroicon-m-check')
                                    ->columnSpan(2)
                                    ->required(),
                                Select::make('is_popular')
                                    ->label('Apakah Unggulan ?')
                                    ->placeholder('Pilih Salah Satu Opsi')
                                    ->options([
                                        true => 'Ya, Unggulan',
                                        false => 'Tidak, Unggulan'
                                    ])
                                    ->default(false)
                                    ->native(false)
                                    ->preload()
                                    ->searchable()
                                    ->columnSpan(3)
                                    ->required(),
                            ])->columns(5),
                        Section::make('')
                            ->schema([
                                Repeater::make('itemPhotos')
                                    ->label('Gambar Barang')
                                    ->relationship()
                                    ->schema([
                                        FileUpload::make('photo')
                                            ->label('')
                                            ->image()
                                            ->imageEditor()
                                            ->imageEditorAspectRatios([
                                                '1:1',
                                            ])
                                            ->imageCropAspectRatio('1:1')
                                            ->directory('item_photos')
                                            ->visibility('public')
                                            ->helperText('Format yang didukung: JPG, PNG, atau GIF.')
                                            ->required(),
                                    ])
                                    ->reorderable(true)
                                    ->reorderableWithButtons()
                                    ->addActionLabel('Tambah Gambar')
                                    ->grid(2),
                            ])->columnSpan(1),
                    ])->columnSpan(3),
                ])
                    ->columns(8)
                    ->columnSpan(2),

            ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Barang')
                    ->formatStateUsing(function (Item $record) {
                        $nameParts = explode(' ', trim($record->name));
                        $initials = isset($nameParts[1])
                            ? strtoupper(substr($nameParts[0], 0, 1) . substr($nameParts[1], 0, 1))
                            : strtoupper(substr($nameParts[0], 0, 1));
                        $photo = $record->thumbnail
                            ? asset('storage/' . $record->thumbnail)
                            : 'https://ui-avatars.com/api/?name=' . $initials . '&amp;color=FFFFFF&amp;background=030712';
                        $image = '<img class="w-10 h-10 rounded-lg" style="margin-right: 0.625rem !important;" src="' . $photo . '" alt="Avatar User">';
                        $nama = '<div class="text-sm font-medium text-gray-800">' . e($record->name) . '</div>';
                        $brand = '<span class="font-light text-gray-300">' . e($record->Brand->name) . '</span>';
                        return '<div class="flex items-center" style="margin-right: 4rem !important">'
                            . $image . '<div>' . $nama . $brand . '</div>
                            </div>';
                    })
                    ->html()
                    ->searchable(),
                ImageColumn::make('itemPhotos.photo')
                    ->label('Foto Barang')
                    ->circular()
                    ->stacked()
                    ->limit(3)
                    ->limitedRemainingText(),
                TextColumn::make('category.name')
                    ->label('Kategori')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('stock')
                    ->label('Stok')
                    ->numeric()
                    ->suffix(' Unit')
                    ->sortable(),
                TextColumn::make('price')
                    ->label('Harga')
                    ->money('IDR', locale: 'id')
                    ->sortable(),
                IconColumn::make('is_popular')
                    ->label('Populer')
                    ->boolean(),
                ToggleColumn::make('is_displayed')
                    ->label('Tampilkan Barang')
                    ->offIcon('heroicon-m-cube')
                    ->onIcon('heroicon-m-check'),
                TextColumn::make('itemSpecifications.name')
                    ->label('Spesifikasi')
                    ->limit(15)
                    ->listWithLineBreaks()
                    ->bulleted()
                    ->limitList(1)
                    ->expandableLimitedList()
                    ->disabledClick(),
            ])
            ->filters([
                SelectFilter::make('brand.name')
                    ->label('Merek / Brand')
                    ->placeholder('Pilih Merek / Brand')
                    ->relationship('brand', 'name')
                    ->native(false)
                    ->preload()
                    ->searchable(),
                SelectFilter::make('category.name')
                    ->label('Kategori')
                    ->placeholder('Pilih Kategori')
                    ->relationship('category', 'name')
                    ->native(false)
                    ->preload()
                    ->searchable(),
            ])
            ->actions([
                ActionGroup::make([
                    ViewAction::make(),
                    EditAction::make()
                        ->color('info'),
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

    public static function getRelations(): array
    {
        return [
            ItemTestimonialsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListItems::route('/'),
            'create' => Pages\CreateItem::route('/create'),
            'view' => Pages\ViewItem::route('/{record}'),
            'edit' => Pages\EditItem::route('/{record}/edit'),
        ];
    }
}
