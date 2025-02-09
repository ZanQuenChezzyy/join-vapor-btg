<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BillingDetailResource\Pages;
use App\Filament\Resources\BillingDetailResource\RelationManagers;
use App\Models\BillingDetail;
use App\Models\Item;
use Filament\Forms;
use Filament\Forms\Components\Fieldset;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Group;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\ToggleButtons;
use Filament\Forms\Components\Wizard;
use Filament\Forms\Components\Wizard\Step;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Support\Enums\Alignment;
use Filament\Support\RawJs;
use Filament\Tables;
use Filament\Tables\Actions\Action;
use Filament\Tables\Actions\ActionGroup;
use Filament\Tables\Actions\BulkActionGroup;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\DeleteBulkAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\ForceDeleteBulkAction;
use Filament\Tables\Actions\RestoreBulkAction;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\Summarizers\Average;
use Filament\Tables\Columns\Summarizers\Sum;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Filters\TrashedFilter;
use Filament\Tables\Grouping\Group as GroupingGroup;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class BillingDetailResource extends Resource
{
    protected static ?string $model = BillingDetail::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function updateTotals(Get $get, Set $set)
    {
        $selectedItems = collect($get('transactionDetails'))->filter(fn($item)
        => !empty($item['item_id']) && !empty($item['quantity']));

        $price = Item::find($selectedItems->pluck('item_id'))->pluck('price', 'id');

        $subtotal = $selectedItems->reduce(function ($subtotal, $item) use ($price) {
            return $subtotal + ($price[$item['item_id']] * $item['quantity']);
        }, 0);

        $total_tax_amount = round($subtotal * 0.003);
        $total_amount = round($subtotal + $total_tax_amount);
        $total_quantity = $selectedItems->sum('quantity');

        $set('sub_total_amount', number_format($subtotal, 0, '.', ','));
        $set('total_tax_amount', number_format($total_tax_amount, 0, '.', ','));
        $set('total_amount', number_format($total_amount, 0, '.', ','));
        $set('quantity', $total_quantity);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Grid::make(2)
                    ->schema([
                        Wizard::make()
                            ->schema([
                                Step::make('Produk & Harga')
                                    ->icon('heroicon-m-shopping-bag')
                                    ->completedIcon('heroicon-m-hand-thumb-up')
                                    ->description('Informasi Transaksi Barang')
                                    ->schema([
                                        Repeater::make('transactionDetails')
                                            ->label('Detail Transaksi Barang')
                                            ->relationship()
                                            ->schema([
                                                Grid::make(5)
                                                    ->schema([
                                                        Select::make('item_id')
                                                            ->label('Pilih Barang')
                                                            ->placeholder('Pilih Barang')
                                                            ->relationship('item', 'name')
                                                            ->native(false)
                                                            ->preload()
                                                            ->searchable()
                                                            ->live(debounce: 800)
                                                            ->afterStateUpdated(function ($state, Set $set, Get $get) {
                                                                $items = Item::find($state);
                                                                $pricePerUnit = $items ? $items->price : 0;
                                                                $quantity = $get('quantity') ?: 1;
                                                                $totalPrice = $pricePerUnit * $quantity;
                                                                $set('price', $totalPrice > 0 ? number_format($totalPrice, 0, '.', ',') : '0');
                                                                $set('quantity', $state ? ($quantity ?? 1) : 0);
                                                            })
                                                            ->columnSpan([
                                                                'default' => 5,
                                                                'md' => 4,
                                                                'lg' => 5,
                                                                'xl' => 4,
                                                                '2xl' => 4,
                                                            ])
                                                            ->required(),

                                                        TextInput::make('quantity')
                                                            ->label('Kuantitas')
                                                            ->numeric()
                                                            ->minLength(1)
                                                            ->maxLength(3)
                                                            ->maxValue(999)
                                                            ->minValue(1)
                                                            ->default(1)
                                                            ->disabled(fn(Get $get) => !$get('item_id'))
                                                            ->live(debounce: 800)
                                                            ->afterStateUpdated(function ($state, callable $set, callable $get) {
                                                                $itemId = $get('item_id');
                                                                $item = Item::find($itemId);
                                                                $pricePerUnit = $item ? $item->price : 0;
                                                                $totalPrice = $pricePerUnit * $state;
                                                                $set('price', $totalPrice > 0 ? number_format($totalPrice, 0, '.', ',') : '0');
                                                            })
                                                            ->columnSpan([
                                                                'default' => 5,
                                                                'md' => 1,
                                                                'lg' => 5,
                                                                'xl' => 1,
                                                                '2xl' => 1,
                                                            ])
                                                            ->required(),

                                                        TextInput::make('price')
                                                            ->label('Harga')
                                                            ->placeholder('Harga')
                                                            ->hint('Harga Akan Terisi Otomatis')
                                                            ->step(50000)
                                                            ->minLength(4)
                                                            ->maxLength(11)
                                                            ->minValue(0000)
                                                            ->maxValue(999999999)
                                                            ->mask(RawJs::make('$money($input)'))
                                                            ->stripCharacters(',')
                                                            ->prefix('Rp')
                                                            ->suffix('.00')
                                                            ->numeric()
                                                            ->disabled()
                                                            ->dehydrated()
                                                            ->columnSpan(5)
                                                            ->required(),
                                                    ])
                                            ])
                                            ->live(debounce: 800)
                                            ->afterStateUpdated(function (Get $get, Set $set) {
                                                self::updateTotals($get, $set);
                                            })
                                            ->minItems(1)
                                            ->addActionLabel('Tambah Barang')
                                            ->grid(2)
                                            ->columnSpanFull(),
                                        Grid::make(12)
                                            ->schema([
                                                TextInput::make('quantity')
                                                    ->label('Total Kuantitas')
                                                    ->placeholder('Total Kuantitas')
                                                    ->minLength(1)
                                                    ->maxLength(3)
                                                    ->minValue(1)
                                                    ->maxValue(999)
                                                    ->disabled()
                                                    ->dehydrated()
                                                    ->columnSpan([
                                                        'default' => 12,
                                                        'lg' => 6,
                                                        'xl' => 2,
                                                        '2xl' => 2,
                                                    ])
                                                    ->required(),
                                                TextInput::make('sub_total_amount')
                                                    ->label('Sub Total Harga')
                                                    ->placeholder('Sub Total Kuantitas')
                                                    ->step(50000)
                                                    ->minLength(4)
                                                    ->maxLength(11)
                                                    ->minValue(0000)
                                                    ->maxValue(99999999999)
                                                    ->mask(RawJs::make('$money($input)'))
                                                    ->stripCharacters(',')
                                                    ->prefix('Rp')
                                                    ->suffix('.00')
                                                    ->disabled()
                                                    ->dehydrated()
                                                    ->columnSpan([
                                                        'default' => 12,
                                                        'lg' => 6,
                                                        'xl' => 3,
                                                        '2xl' => 3,
                                                    ])
                                                    ->required(),
                                                TextInput::make('total_tax_amount')
                                                    ->label('Total Pajak')
                                                    ->placeholder('Total Pajak')
                                                    ->hint('Pajak 0,3%')
                                                    ->step(50000)
                                                    ->minLength(4)
                                                    ->maxLength(11)
                                                    ->minValue(0000)
                                                    ->maxValue(99999999999)
                                                    ->mask(RawJs::make('$money($input)'))
                                                    ->stripCharacters(',')
                                                    ->prefix('Rp')
                                                    ->suffix('.00')
                                                    ->disabled()
                                                    ->dehydrated()
                                                    ->columnSpan([
                                                        'default' => 12,
                                                        'lg' => 6,
                                                        'xl' => 3,
                                                        '2xl' => 3,
                                                    ])
                                                    ->required(),
                                                TextInput::make('total_amount')
                                                    ->label('Total Harga')
                                                    ->placeholder('Total Harga')
                                                    ->step(50000)
                                                    ->minLength(4)
                                                    ->maxLength(11)
                                                    ->minValue(0000)
                                                    ->maxValue(999999999)
                                                    ->mask(RawJs::make('$money($input)'))
                                                    ->stripCharacters(',')
                                                    ->prefix('Rp')
                                                    ->suffix('.00')
                                                    ->disabled()
                                                    ->dehydrated()
                                                    ->columnSpan([
                                                        'default' => 12,
                                                        'lg' => 6,
                                                        'xl' => 4,
                                                        '2xl' => 4,
                                                    ])
                                                    ->required(),
                                            ])
                                    ])->columns(2),
                                Step::make('Pelanggan')
                                    ->icon('heroicon-m-user')
                                    ->completedIcon('heroicon-m-hand-thumb-up')
                                    ->description('Informasi Pelanggan')
                                    ->schema([
                                        Grid::make(2)
                                            ->schema([
                                                Group::make([
                                                    Select::make('on_store')
                                                        ->label('Metode Pembelian')
                                                        ->inlineLabel()
                                                        ->options([
                                                            true => 'Pembelian di Toko',
                                                            false => 'Pembelian Online'
                                                        ])
                                                        ->default(false)
                                                        ->native(false)
                                                        ->preload()
                                                        ->searchable()
                                                        ->live()
                                                        ->required(),
                                                    Fieldset::make('Informasi Pelanggan')
                                                        ->schema([
                                                            TextInput::make('name')
                                                                ->label('Nama Lengkap Pelanggan')
                                                                ->placeholder('Masukkan Nama Lengkap')
                                                                ->minLength(3)
                                                                ->maxLength(45)
                                                                ->columnSpanFull()
                                                                ->required(),
                                                            TextInput::make('email')
                                                                ->label('Email Pelanggan')
                                                                ->placeholder('Masukkan Email')
                                                                ->minLength(8)
                                                                ->maxLength(45)
                                                                ->email()
                                                                ->required(),
                                                            TextInput::make('phone')
                                                                ->label('Nomor Telepon Pelanggan')
                                                                ->placeholder('Masukkan No Telepon')
                                                                ->prefix('+62')
                                                                ->tel()
                                                                ->minLength(11)
                                                                ->maxLength(15)
                                                                ->numeric()
                                                                ->required(),
                                                        ]),
                                                ])->columnSpan(fn(Get $get): ?string => $get('on_store') ? 2 : 1),
                                                Fieldset::make('Alamat Pengiriman')
                                                    ->schema([
                                                        Select::make('city')
                                                            ->label('Kabupaten / Kota')
                                                            ->placeholder('Pilih Kabupaten / Kota')
                                                            ->options(function () {
                                                                $jsonPath = resource_path('json/kota.json');
                                                                if (file_exists($jsonPath)) {
                                                                    $jsonData = json_decode(file_get_contents($jsonPath), true);
                                                                    return collect($jsonData)->pluck('name', 'name')->toArray();
                                                                }
                                                                return [];
                                                            })
                                                            ->native(false)
                                                            ->preload()
                                                            ->searchable()
                                                            ->required(fn(Get $get): bool => !$get('on_store')),
                                                        TextInput::make('post_code')
                                                            ->label('Kode Pos')
                                                            ->placeholder('Masukkan Kode Pos')
                                                            ->minLength(5)
                                                            ->maxLength(5)
                                                            ->numeric()
                                                            ->required(fn(Get $get): bool => !$get('on_store')),
                                                        Textarea::make('address')
                                                            ->label('Alamat lengkap')
                                                            ->placeholder('Masukkan Alamat Lengkap')
                                                            ->minLength(10)
                                                            ->helperText('Contoh: Jalan Merpati No. 12, RT 03/RW 01, Kelurahan Gunung Elai, Bontang, Kalimantan Timur, 75325')
                                                            ->columnSpanFull()
                                                            ->rows(2)
                                                            ->autosize()
                                                            ->required(fn(Get $get): bool => !$get('on_store')),
                                                    ])->columnSpan(1)
                                                    ->visible(fn(Get $get): bool => !$get('on_store'))
                                            ])
                                    ]),
                                Step::make('Pembayaran')
                                    ->icon('heroicon-m-credit-card')
                                    ->completedIcon('heroicon-m-hand-thumb-up')
                                    ->description('Informasi Pembayaran')
                                    ->schema([
                                        Grid::make(2)
                                            ->schema([
                                                Group::make([
                                                    TextInput::make('item_trx_id')
                                                        ->label('ID Transaksi')
                                                        ->placeholder('Masukkan ID Transaksi')
                                                        ->minLength(3)
                                                        ->maxLength(50)
                                                        ->required(),
                                                    ToggleButtons::make('is_paid')
                                                        ->label('Status Pembayaran')
                                                        ->boolean()
                                                        ->inline()
                                                        ->options([
                                                            true => 'Pembayaran Selesai',
                                                            false => 'Menunggu Pembayaran',
                                                        ])
                                                        ->icons([
                                                            true => 'heroicon-o-banknotes',
                                                            false => 'heroicon-o-clock',
                                                        ])
                                                        ->colors([
                                                            true => 'success',
                                                            false => 'warning',
                                                        ])
                                                        ->default(false)
                                                        ->required(),
                                                ]),
                                                FileUpload::make('payment_proof')
                                                    ->label('Bukti Pembayaran')
                                                    ->image()
                                                    ->imageEditor()
                                                    ->directory('payment_proof')
                                                    ->visibility('public')
                                                    ->helperText('Format yang didukung: JPG, PNG, atau GIF.')
                                                    ->required(),
                                            ])
                                    ])
                            ])->columnSpan(2)
                            ->skippable()
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->poll('10s')
            ->groups([
                GroupingGroup::make('is_paid')
                    ->label('Status Pembayaran')
                    ->getTitleFromRecordUsing(fn(BillingDetail $record): string => match ($record->is_paid) {
                        0 => 'Menunggu Pembayaran',
                        1 => 'Pembayaran Berhasil',
                        default => 'Tidak Diketahui',
                    })
                    ->getDescriptionFromRecordUsing(fn(BillingDetail $record): string => match ($record->is_paid) {
                        0 => 'Menampilkan status pembayaran yang masih menunggu konfirmasi.',
                        1 => 'Menampilkan status transaksi yang telah berhasil dibayar.',
                        default => 'Status pembayaran belum diketahui.',
                    })
                    ->collapsible(),
                GroupingGroup::make('on_store')
                    ->label('Metode Transaksi')
                    ->getTitleFromRecordUsing(fn(BillingDetail $record): string => match ($record->on_store) {
                        0 => 'Pembelian Online',
                        1 => 'Datang Ke Toko',
                        default => 'Tidak Diketahui',
                    })
                    ->getDescriptionFromRecordUsing(fn(BillingDetail $record): string => match ($record->on_store) {
                        0 => 'Menampilkan transaksi yang dilakukan secara online.',
                        1 => 'Menampilkan transaksi yang dilakukan dengan datang langsung ke toko.',
                        default => 'Metode transaksi tidak diketahui.',
                    })
                    ->collapsible(),
            ])
            ->defaultGroup(
                GroupingGroup::make('on_store')
                    ->label('Metode Transaksi')
                    ->getTitleFromRecordUsing(fn(BillingDetail $record): string => match ($record->on_store) {
                        0 => 'Online',
                        1 => 'Datang Ke Toko',
                        default => 'Unknown',
                    })
                    ->getDescriptionFromRecordUsing(fn(BillingDetail $record): string => match ($record->on_store) {
                        0 => 'Menampilkan transaksi yang dilakukan secara online.',
                        1 => 'Menampilkan transaksi yang dilakukan dengan datang langsung ke toko.',
                        default => 'Metode transaksi tidak diketahui.',
                    })
                    ->collapsible(),
            )
            ->columns([
                TextColumn::make('created_at')
                    ->label('Waktu Transaksi')
                    ->since()
                    ->dateTimeTooltip()
                    ->description(fn(BillingDetail $record): string => $record->created_at->Translatedformat('l, d F Y, H:i'))
                    ->sortable(),
                TextColumn::make('item_trx_id')
                    ->label('ID Transaksi'),
                TextColumn::make('name')
                    ->label('Nama Pelanggan')
                    ->description(fn(BillingDetail $record): String => $record->email)
                    ->searchable(),
                TextColumn::make('is_paid')
                    ->label('Pembayaran')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        '1' => 'success',
                        '0' => 'warning',
                        default => 'gray',
                    })
                    ->icon(fn(string $state): string => match ($state) {
                        '1' => 'heroicon-o-banknotes',
                        '0' => 'heroicon-o-clock',
                        default => 'heroicon-s-question',
                    })
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        '1' => 'Pembayaran Selesai',
                        '0' => 'Menunggu Pembayaran',
                        default => 'Status Tidak Dikenal',
                    }),
                TextColumn::make('total_amount')
                    ->label('Total Harga')
                    ->numeric()
                    ->money('IDR', locale: 'id')
                    ->summarize(
                        Sum::make()
                            ->query(fn($query) => $query->where('is_paid', true))
                            ->label('Total Pendapatan')
                            ->money('IDR', locale: 'id')
                    ),
                IconColumn::make('on_store')
                    ->label('Transaksi')
                    ->trueIcon('heroicon-o-building-storefront')
                    ->falseIcon('heroicon-o-computer-desktop')
                    ->trueColor('info')
                    ->falseColor('info')
                    ->tooltip('Metode Transaksi Online / Offline')
                    ->wrap()
                    ->boolean()
                    ->alignment(Alignment::Center),
                TextColumn::make('deleted_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                TrashedFilter::make()
                    ->label('Transaksi Yang Dihapus')
                    ->native(false)
                    ->preload()
                    ->searchable(),
                TernaryFilter::make('is_paid')
                    ->label('Status Pembayaran')
                    ->placeholder('Pilih Status Pembayaran')
                    ->trueLabel('Pembayaran Berhasil')
                    ->falseLabel('Menunggu Pembayaran')
                    ->native(false)
                    ->preload()
                    ->searchable(),
            ])
            ->actions([
                Action::make('approve')
                    ->label('Konfirmasi')
                    ->icon('heroicon-o-banknotes')
                    ->color('success')
                    ->tooltip('Konfirmasi Pembayaran')
                    ->action(function (BillingDetail $record) {
                        $record->is_paid = true;
                        $record->save();

                        Notification::make()
                            ->title('Transaksi Dikonfirmasi')
                            ->body('Status Pembayaran Telah Di ubah menjadi sudah dibayar.')
                            ->success()
                            ->send();
                    })
                    ->requiresConfirmation()
                    ->visible(fn(BillingDetail $record) => !$record->is_paid),

                Action::make('pending')
                    ->label('Tunda')
                    ->icon('heroicon-o-clock')
                    ->color('warning')
                    ->tooltip('Tunda Pembayaran')
                    ->action(function (BillingDetail $record) {
                        $record->is_paid = false;
                        $record->save();

                        Notification::make()
                            ->title('Transaksi Ditunda')
                            ->body('Status Pembayaran Telah Di ubah menjadi Menunggu Pembayaran.')
                            ->success()
                            ->send();
                    })
                    ->requiresConfirmation()
                    ->visible(fn(BillingDetail $record) => $record->is_paid),

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
                    ForceDeleteBulkAction::make(),
                    RestoreBulkAction::make(),
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
            'index' => Pages\ListBillingDetails::route('/'),
            'create' => Pages\CreateBillingDetail::route('/create'),
            'view' => Pages\ViewBillingDetail::route('/{record}'),
            'edit' => Pages\EditBillingDetail::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
    }
}
