// MarketplaceView — premium dark UI with Stripe-like payment flow
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import type { ProdutoSuplemento } from '../data/types';

// ─── Extended product catalogue (15 items) ───────────────────────────────────

type LocalProduct = ProdutoSuplemento & { descricao: string; lojaId: string };

const PRODUCTS: LocalProduct[] = [
  // Proteínas
  { id: 'p01', nome: 'Whey Protein Concentrado 900g', preco: 149.90, categoria: 'Proteína', descricao: '24g proteína por dose — chocolate', lojaId: 'l1' },
  { id: 'p02', nome: 'Whey Protein Isolado 900g', preco: 189.90, categoria: 'Proteína', descricao: 'Absorção rápida, baixo lactose', lojaId: 'l1' },
  { id: 'p03', nome: 'Proteína Vegana Pea 500g', preco: 119.90, categoria: 'Proteína', descricao: 'Plant-based, 20g/dose', lojaId: 'l2' },
  { id: 'p04', nome: 'Mass Gainer Hipercalórico 3kg', preco: 219.90, categoria: 'Proteína', descricao: 'Para ganho de massa muscular', lojaId: 'l1' },
  // Performance / Creatina
  { id: 'p05', nome: 'Creatina Monohidratada 300g', preco: 89.90, categoria: 'Performance', descricao: 'Pureza 99,9% Creapure® certificada', lojaId: 'l1' },
  { id: 'p06', nome: 'Creatina HCL 90 cáps', preco: 74.90, categoria: 'Performance', descricao: 'Alta solubilidade, sem retenção', lojaId: 'l3' },
  // Pré-treino
  { id: 'p07', nome: 'Pre-Workout Explode 300g', preco: 99.90, categoria: 'Pré-Treino', descricao: 'Cafeína + Beta-alanina + Citrulina', lojaId: 'l1' },
  { id: 'p08', nome: 'Pump Formula Stim-Free 250g', preco: 84.90, categoria: 'Pré-Treino', descricao: 'Sem estimulantes, máximo pump', lojaId: 'l3' },
  { id: 'p09', nome: 'Pre-Workout Night Edition 200g', preco: 109.90, categoria: 'Pré-Treino', descricao: 'Fórmula noturna com L-Teanina', lojaId: 'l2' },
  // Vitaminas
  { id: 'p10', nome: 'Multivitamínico Esportivo 60 cáps', preco: 45.00, categoria: 'Vitaminas', descricao: '27 vitaminas e minerais essenciais', lojaId: 'l2' },
  { id: 'p11', nome: 'Vitamina D3 + K2 60 cáps', preco: 38.90, categoria: 'Vitaminas', descricao: 'Suporte ósseo e imunológico', lojaId: 'l2' },
  { id: 'p12', nome: 'Ômega-3 TG Form 120 cáps', preco: 62.90, categoria: 'Vitaminas', descricao: 'EPA + DHA forma triglicerídeo', lojaId: 'l3' },
  // Aminoácidos
  { id: 'p13', nome: 'BCAA 2:1:1 120 cáps', preco: 59.90, categoria: 'Aminoácidos', descricao: 'Recuperação muscular e anticatabolismo', lojaId: 'l2' },
  { id: 'p14', nome: 'Glutamina 300g', preco: 54.90, categoria: 'Aminoácidos', descricao: 'Recuperação intestinal e muscular', lojaId: 'l1' },
  { id: 'p15', nome: 'EAA Complex 200g', preco: 79.90, categoria: 'Aminoácidos', descricao: '9 aminoácidos essenciais em pó', lojaId: 'l3' },
];

const CATEGORIES = ['Todos', 'Proteína', 'Performance', 'Pré-Treino', 'Vitaminas', 'Aminoácidos'];

const EMOJI: Record<string, string> = {
  Proteína: '🥤',
  Performance: '💪',
  'Pré-Treino': '⚡',
  Vitaminas: '🌿',
  Aminoácidos: '🔗',
};

const STORES = [
  { id: 'l1', nome: 'NutriMax Suplementos', icon: 'medkit' as const, rating: 4.8, accent: Colors.primary, total: 6 },
  { id: 'l2', nome: 'Vida Fit Store', icon: 'leaf' as const, rating: 4.6, accent: Colors.success, total: 5 },
  { id: 'l3', nome: 'Alpha Performance', icon: 'flash' as const, rating: 4.9, accent: Colors.accent, total: 4 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCard(v: string) {
  return v.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
}

function fmtExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
}

function fmtBRL(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getCatColor(cat: string): string {
  const map: Record<string, string> = {
    Proteína: Colors.primary,
    Performance: Colors.primary2,
    'Pré-Treino': '#FF4D4D',
    Vitaminas: Colors.success,
    Aminoácidos: Colors.accent,
  };
  return map[cat] ?? Colors.textSecondary;
}

type CartMap = Record<string, { produto: LocalProduct; qty: number }>;
type FlowStep = 'cart' | 'payment' | 'processing' | 'success';

// ─── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard({ produto, onAdd }: { produto: LocalProduct; onAdd: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const catColor = getCatColor(produto.categoria);

  return (
    <Animated.View style={[ps.card, { transform: [{ scale }] }]}>
      <Pressable
        onPressIn={() =>
          Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 60, bounciness: 2 }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }).start()
        }
        style={ps.inner}
      >
        <View style={[ps.strip, { backgroundColor: catColor }]} />
        <View style={[ps.emojiBox, { backgroundColor: catColor + '20' }]}>
          <Text style={ps.emoji}>{EMOJI[produto.categoria] ?? '💊'}</Text>
        </View>
        <View style={[ps.badge, { backgroundColor: catColor + '22' }]}>
          <Text style={[ps.badgeText, { color: catColor }]}>{produto.categoria}</Text>
        </View>
        <Text style={ps.nome} numberOfLines={2}>{produto.nome}</Text>
        <Text style={ps.desc} numberOfLines={1}>{produto.descricao}</Text>
        <View style={ps.footer}>
          <Text style={ps.preco}>{fmtBRL(produto.preco)}</Text>
          <TouchableOpacity
            style={[ps.addBtn, { backgroundColor: catColor }]}
            onPress={onAdd}
            activeOpacity={0.75}
          >
            <Ionicons name="add" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── CartScreen ───────────────────────────────────────────────────────────────

function CartScreen({
  items,
  total,
  onAdd,
  onRemove,
  onClose,
  onCheckout,
}: {
  items: { produto: LocalProduct; qty: number }[];
  total: number;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  onCheckout: () => void;
}) {
  return (
    <>
      <View style={m.sheetHeader}>
        <Text style={m.sheetTitle}>Carrinho</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={m.empty}>
          <Ionicons name="cart-outline" size={56} color={Colors.textTertiary} />
          <Text style={m.emptyTitle}>Carrinho vazio</Text>
          <Text style={m.emptySub}>Adicione produtos para continuar</Text>
        </View>
      ) : (
        <>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={m.cartList}>
            {items.map(({ produto, qty }) => (
              <View key={produto.id} style={m.cartRow}>
                <Text style={m.cartEmoji}>{EMOJI[produto.categoria] ?? '💊'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={m.cartName} numberOfLines={1}>{produto.nome}</Text>
                  <Text style={m.cartCat}>{produto.categoria}</Text>
                </View>
                <View style={m.qtyCtrl}>
                  <TouchableOpacity style={m.qtyBtn} onPress={() => onRemove(produto.id)}>
                    <Ionicons name="remove" size={14} color={Colors.text} />
                  </TouchableOpacity>
                  <Text style={m.qtyNum}>{qty}</Text>
                  <TouchableOpacity style={m.qtyBtn} onPress={() => onAdd(produto.id)}>
                    <Ionicons name="add" size={14} color={Colors.text} />
                  </TouchableOpacity>
                </View>
                <Text style={m.cartPrice}>{fmtBRL(produto.preco * qty)}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={m.totalRow}>
            <Text style={m.totalLabel}>SUBTOTAL</Text>
            <Text style={m.totalValue}>{fmtBRL(total)}</Text>
          </View>

          <TouchableOpacity style={m.checkoutBtn} onPress={onCheckout} activeOpacity={0.85}>
            <Ionicons name="card" size={20} color="#FFF" />
            <Text style={m.checkoutText}>Ir para pagamento</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </>
      )}
    </>
  );
}

// ─── PaymentScreen ────────────────────────────────────────────────────────────

function PaymentScreen({
  total,
  cardNum,
  setCardNum,
  expiry,
  setExpiry,
  cvv,
  setCvv,
  cardName,
  setCardName,
  onBack,
  onPay,
}: {
  total: number;
  cardNum: string;
  setCardNum: (v: string) => void;
  expiry: string;
  setExpiry: (v: string) => void;
  cvv: string;
  setCvv: (v: string) => void;
  cardName: string;
  setCardName: (v: string) => void;
  onBack: () => void;
  onPay: () => void;
}) {
  const isWeb = Platform.OS === 'web';

  return (
    <>
      <View style={m.sheetHeader}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={m.sheetTitle}>Pagamento</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={m.payList} showsVerticalScrollIndicator={false}>
        {/* Demo mode banner */}
        <View style={m.demoBanner}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.accent} />
          <Text style={m.demoBannerText}>Modo demonstração — nenhuma cobrança real</Text>
        </View>

        {/* Card form */}
        <View style={[m.cardForm, isWeb ? m.cardFormWeb : undefined]}>
          <View style={m.stripeHeader}>
            <Text style={[m.stripeCardLabel, isWeb ? m.stripeCardLabelWeb : undefined]}>
              Dados do Cartão
            </Text>
            <View style={[m.stripeLogoWrap, isWeb ? m.stripeLogoWrapWeb : undefined]}>
              <Text style={[m.stripeWordmark, isWeb ? m.stripeWordmarkWeb : undefined]}>stripe</Text>
            </View>
          </View>

          {/* Card number */}
          <View style={m.fieldGroup}>
            <Text style={[m.fieldLabel, isWeb ? m.fieldLabelWeb : undefined]}>Número do cartão</Text>
            <View style={[m.inputRow, isWeb ? m.inputRowWeb : undefined]}>
              <Ionicons name="card-outline" size={18} color={isWeb ? '#9CA3AF' : Colors.textTertiary} />
              <TextInput
                style={[m.input, isWeb ? m.inputWeb : undefined]}
                value={cardNum}
                onChangeText={setCardNum}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={isWeb ? '#9CA3AF' : Colors.textTertiary}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>
          </View>

          {/* Expiry + CVV */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[m.fieldGroup, { flex: 1 }]}>
              <Text style={[m.fieldLabel, isWeb ? m.fieldLabelWeb : undefined]}>Validade</Text>
              <View style={[m.inputRow, isWeb ? m.inputRowWeb : undefined]}>
                <TextInput
                  style={[m.input, isWeb ? m.inputWeb : undefined]}
                  value={expiry}
                  onChangeText={setExpiry}
                  placeholder="MM/AA"
                  placeholderTextColor={isWeb ? '#9CA3AF' : Colors.textTertiary}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
            </View>
            <View style={[m.fieldGroup, { flex: 1 }]}>
              <Text style={[m.fieldLabel, isWeb ? m.fieldLabelWeb : undefined]}>CVV</Text>
              <View style={[m.inputRow, isWeb ? m.inputRowWeb : undefined]}>
                <TextInput
                  style={[m.input, isWeb ? m.inputWeb : undefined]}
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="•••"
                  placeholderTextColor={isWeb ? '#9CA3AF' : Colors.textTertiary}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          {/* Name on card */}
          <View style={m.fieldGroup}>
            <Text style={[m.fieldLabel, isWeb ? m.fieldLabelWeb : undefined]}>Nome no cartão</Text>
            <View style={[m.inputRow, isWeb ? m.inputRowWeb : undefined]}>
              <Ionicons name="person-outline" size={18} color={isWeb ? '#9CA3AF' : Colors.textTertiary} />
              <TextInput
                style={[m.input, isWeb ? m.inputWeb : undefined]}
                value={cardName}
                onChangeText={setCardName}
                placeholder="COMO APARECE NO CARTÃO"
                placeholderTextColor={isWeb ? '#9CA3AF' : Colors.textTertiary}
                autoCapitalize="characters"
              />
            </View>
          </View>
        </View>

        {/* Pay button */}
        <TouchableOpacity style={m.payBtn} onPress={onPay} activeOpacity={0.85}>
          <Ionicons name="lock-closed" size={18} color="#FFF" />
          <Text style={m.payBtnText}>Pagar {fmtBRL(total)}</Text>
        </TouchableOpacity>

        <Text style={m.secureNote}>🔒 Pagamento seguro com criptografia TLS</Text>
      </ScrollView>
    </>
  );
}

// ─── SuccessScreen ────────────────────────────────────────────────────────────

function SuccessScreen({
  total,
  checkScale,
  onClose,
}: {
  total: number;
  checkScale: Animated.Value;
  onClose: () => void;
}) {
  useEffect(() => {
    Animated.spring(checkScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 8,
      bounciness: 14,
    }).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={m.successView}>
      <Animated.View style={[m.checkCircle, { transform: [{ scale: checkScale }] }]}>
        <Ionicons name="checkmark" size={60} color="#FFF" />
      </Animated.View>
      <Text style={m.successTitle}>Pagamento confirmado!</Text>
      <Text style={m.successSub}>Seu pedido foi processado com sucesso</Text>
      <Text style={m.successTotal}>{fmtBRL(total)}</Text>
      <TouchableOpacity style={m.successBtn} onPress={onClose} activeOpacity={0.85}>
        <Text style={m.successBtnText}>Continuar comprando</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function MarketplaceScreen() {
  const [carrinho, setCarrinho] = useState<CartMap>({});
  const [showModal, setShowModal] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStep>('cart');
  const [selectedCat, setSelectedCat] = useState('Todos');

  // Payment form fields
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Success animation value
  const checkScale = useRef(new Animated.Value(0)).current;

  // Derived
  const cartItems = Object.values(carrinho);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const total = cartItems.reduce((s, i) => s + i.produto.preco * i.qty, 0);
  const filtered = selectedCat === 'Todos' ? PRODUCTS : PRODUCTS.filter(p => p.categoria === selectedCat);

  function addToCart(produto: LocalProduct) {
    setCarrinho(prev => ({
      ...prev,
      [produto.id]: { produto, qty: (prev[produto.id]?.qty ?? 0) + 1 },
    }));
  }

  function removeOne(id: string) {
    setCarrinho(prev => {
      const item = prev[id];
      if (!item) return prev;
      if (item.qty <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { ...item, qty: item.qty - 1 } };
    });
  }

  function addOne(id: string) {
    setCarrinho(prev => {
      const item = prev[id];
      if (!item) return prev;
      return { ...prev, [id]: { ...item, qty: item.qty + 1 } };
    });
  }

  function openCart() {
    setFlowStep('cart');
    setShowModal(true);
  }

  function handlePay() {
    setFlowStep('processing');
    setTimeout(() => setFlowStep('success'), 1800);
  }

  function closeModal() {
    const wasSuccess = flowStep === 'success';
    setShowModal(false);
    setFlowStep('cart');
    if (wasSuccess) {
      setCarrinho({});
      setCardNum('');
      setExpiry('');
      setCvv('');
      setCardName('');
      setTimeout(() => checkScale.setValue(0), 400);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Marketplace</Text>
          <Text style={s.headerSub}>Suplementos &amp; parceiros</Text>
        </View>
        <TouchableOpacity style={s.cartBtn} onPress={openCart} activeOpacity={0.85}>
          <Ionicons name="cart" size={22} color="#FFF" />
          {cartCount > 0 && (
            <View style={s.cartBadge}>
              <Text style={s.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.tabsBar}
        contentContainerStyle={s.tabsContent}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[s.tab, selectedCat === cat && s.tabActive]}
            onPress={() => setSelectedCat(cat)}
            activeOpacity={0.75}
          >
            <Text style={[s.tabText, selectedCat === cat && s.tabTextActive]}>
              {cat === 'Todos' ? cat : `${EMOJI[cat] ?? ''} ${cat}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main scroll */}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionLabel}>PRODUTOS</Text>
        <View style={s.grid}>
          {filtered.map(produto => (
            <ProductCard key={produto.id} produto={produto} onAdd={() => addToCart(produto)} />
          ))}
        </View>

        <Text style={[s.sectionLabel, { marginTop: 28 }]}>PARCEIROS PREMIUM</Text>
        {STORES.map(store => (
          <View key={store.id} style={[s.storeCard, { borderTopColor: store.accent }]}>
            <View style={[s.storeIconWrap, { backgroundColor: store.accent + '22' }]}>
              <Ionicons name={store.icon} size={30} color={store.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.storeName}>{store.nome}</Text>
              <Text style={s.storeInfo}>{store.total} produtos disponíveis</Text>
            </View>
            <View style={s.storeRight}>
              <View style={s.ratingRow}>
                <Ionicons name="star" size={11} color={Colors.primary2} />
                <Text style={s.ratingText}> {store.rating.toFixed(1)}</Text>
              </View>
              <TouchableOpacity
                style={[s.verLojaBtn, { borderColor: store.accent }]}
                activeOpacity={0.75}
              >
                <Text style={[s.verLojaBtnText, { color: store.accent }]}>Ver loja</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Cart FAB */}
      <TouchableOpacity style={s.fab} onPress={openCart} activeOpacity={0.85}>
        <Ionicons name="cart" size={26} color="#FFF" />
        {cartCount > 0 && (
          <View style={s.fabBadge}>
            <Text style={s.fabBadgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Flow modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={m.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={m.sheet}>
            <View style={m.handle} />

            {flowStep === 'cart' && (
              <CartScreen
                items={cartItems}
                total={total}
                onAdd={addOne}
                onRemove={removeOne}
                onClose={closeModal}
                onCheckout={() => setFlowStep('payment')}
              />
            )}

            {flowStep === 'payment' && (
              <PaymentScreen
                total={total}
                cardNum={cardNum}
                setCardNum={v => setCardNum(fmtCard(v))}
                expiry={expiry}
                setExpiry={v => setExpiry(fmtExpiry(v))}
                cvv={cvv}
                setCvv={v => setCvv(v.replace(/\D/g, '').slice(0, 3))}
                cardName={cardName}
                setCardName={setCardName}
                onBack={() => setFlowStep('cart')}
                onPay={handlePay}
              />
            )}

            {flowStep === 'processing' && (
              <View style={m.processingView}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={m.processingText}>Processando pagamento…</Text>
              </View>
            )}

            {flowStep === 'success' && (
              <SuccessScreen total={total} checkScale={checkScale} onClose={closeModal} />
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Product card styles ──────────────────────────────────────────────────────

const ps = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOpacity: 0.3,
    elevation: 4,
  },
  inner: {
    paddingBottom: 12,
  },
  strip: {
    height: 3,
  },
  emojiBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 12,
    marginBottom: 8,
  },
  emoji: {
    fontSize: 22,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginHorizontal: 12,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  nome: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 18,
    marginHorizontal: 12,
    marginBottom: 3,
  },
  desc: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginHorizontal: 12,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  preco: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Main screen styles ───────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowRadius: 14,
    shadowOpacity: 0.4,
    elevation: 6,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FFF',
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  tabsBar: {
    flexGrow: 0,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 10,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  storeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderTopWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOpacity: 0.2,
    elevation: 3,
  },
  storeIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  storeInfo: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  storeRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary2,
  },
  verLojaBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  verLojaBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowRadius: 16,
    shadowOpacity: 0.45,
    elevation: 10,
  },
  fabBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
});

// ─── Modal styles ─────────────────────────────────────────────────────────────

const m = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.glassBorder,
    alignSelf: 'center',
    marginBottom: 12,
  },
  // ── Cart ──
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  cartList: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cartEmoji: {
    fontSize: 22,
  },
  cartName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  cartCat: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  qtyCtrl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: Colors.glassBackground,
  },
  qtyNum: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  cartPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary2,
    minWidth: 56,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  checkoutBtn: {
    marginHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowRadius: 14,
    shadowOpacity: 0.35,
    elevation: 6,
  },
  checkoutText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  // ── Payment ──
  payList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent + '18',
    borderWidth: 1,
    borderColor: Colors.accent + '40',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  demoBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
    flex: 1,
  },
  cardForm: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: 20,
    gap: 16,
  },
  cardFormWeb: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowRadius: 20,
    shadowOpacity: 0.08,
    elevation: 2,
  },
  stripeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stripeCardLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  stripeCardLabelWeb: {
    color: '#111827',
  },
  stripeLogoWrap: {
    backgroundColor: Colors.glassBackground,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stripeLogoWrapWeb: {
    backgroundColor: '#F3F4FF',
  },
  stripeWordmark: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textTertiary,
    letterSpacing: -0.3,
  },
  stripeWordmarkWeb: {
    color: '#6772E5',
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
    letterSpacing: 0.3,
  },
  fieldLabelWeb: {
    color: '#6B7280',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputRowWeb: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  } as any,
  inputWeb: {
    color: '#111827',
    outlineStyle: 'none',
  } as any,
  payBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowRadius: 16,
    shadowOpacity: 0.4,
    elevation: 6,
  },
  payBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 17,
  },
  secureNote: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textTertiary,
  },
  // ── Processing ──
  processingView: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  // ── Success ──
  successView: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    gap: 10,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.success,
    shadowRadius: 24,
    shadowOpacity: 0.5,
    elevation: 10,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  successTotal: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.success,
    marginTop: 4,
    marginBottom: 4,
  },
  successBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginTop: 8,
  },
  successBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
});
