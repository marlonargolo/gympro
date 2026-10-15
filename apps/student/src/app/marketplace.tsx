// MarketplaceView — premium dark UI rewrite
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
  Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { mockLojas } from '../data/mock-data';
import type { ProdutoSuplemento } from '../data/types';

export default function MarketplaceScreen() {
  const [carrinho, setCarrinho] = useState<ProdutoSuplemento[]>([]);
  const [showCarrinho, setShowCarrinho] = useState(false);

  function addToCart(produto: ProdutoSuplemento) {
    setCarrinho(v => [...v, produto]);
  }

  function removeFromCart(id: string) {
    const idx = carrinho.findIndex(p => p.id === id);
    if (idx !== -1) {
      setCarrinho(v => { const a = [...v]; a.splice(idx, 1); return a; });
    }
  }

  const total = carrinho.reduce((s, p) => s + p.preco, 0);

  // Group cart items by id for display
  const carrinhoAgrupado = carrinho.reduce<Record<string, { produto: ProdutoSuplemento; qty: number }>>((acc, item) => {
    if (acc[item.id]) {
      acc[item.id].qty += 1;
    } else {
      acc[item.id] = { produto: item, qty: 1 };
    }
    return acc;
  }, {});

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Marketplace</Text>
          <Text style={s.headerSub}>Suplementos &amp; parceiros</Text>
        </View>
        <TouchableOpacity style={s.cartBtn} onPress={() => setShowCarrinho(true)}>
          <Ionicons name="cart" size={22} color="#FFF" />
          {carrinho.length > 0 && (
            <View style={s.cartBadge}>
              <Text style={s.cartBadgeText}>{carrinho.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Section label ── */}
      <Text style={s.sectionLabel}>LOJAS PARCEIRAS</Text>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {mockLojas.map(loja => (
          <View key={loja.id} style={s.lojaCard}>
            {/* 3px top accent strip */}
            <View style={s.lojaStrip} />

            {/* Loja header */}
            <View style={s.lojaHeader}>
              <View style={s.lojaIconCircle}>
                <Ionicons name={loja.logoIcon as any} size={32} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.lojaNome}>{loja.nome}</Text>
                <Text style={s.lojaSub}>{loja.produtos.length} produtos</Text>
              </View>
              <View style={s.lojaRightChip}>
                <Ionicons name="star" size={11} color={Colors.primary2} />
                <Text style={s.lojaRatingText}> 4.8</Text>
              </View>
            </View>

            {/* Product grid */}
            <View style={s.productGrid}>
              {loja.produtos.map(produto => (
                <View key={produto.id} style={s.productCard}>
                  <View style={s.productCardInner}>
                    <Text style={s.productCateg} numberOfLines={1}>
                      {produto.categoria.toUpperCase()}
                    </Text>
                    <Text style={s.productNome} numberOfLines={2}>
                      {produto.nome}
                    </Text>
                    <Text style={s.productPreco}>
                      {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={s.addCircle}
                    onPress={() => addToCart(produto)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}
        {/* spacer for FAB */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── Cart FAB ── */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => setShowCarrinho(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="cart" size={26} color="#FFF" />
        {carrinho.length > 0 && (
          <View style={s.fabBadge}>
            <Text style={s.fabBadgeText}>{carrinho.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ── Cart Modal ── */}
      <Modal visible={showCarrinho} animationType="slide" transparent>
        <View style={cm.overlay}>
          <View style={cm.sheet}>
            <View style={cm.handle} />
            <View style={cm.sheetHeader}>
              <Text style={cm.sheetTitle}>Carrinho</Text>
              <TouchableOpacity onPress={() => setShowCarrinho(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {carrinho.length === 0 ? (
              <View style={cm.empty}>
                <Ionicons name="cart-outline" size={56} color={Colors.textTertiary} />
                <Text style={cm.emptyTitle}>Carrinho vazio</Text>
                <Text style={cm.emptySub}>Adicione produtos às lojas parceiras</Text>
              </View>
            ) : (
              <>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={cm.list}>
                  {Object.values(carrinhoAgrupado).map(({ produto, qty }) => (
                    <View key={produto.id} style={cm.cartRow}>
                      <View style={cm.cartDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={cm.cartItemName} numberOfLines={1}>
                          {produto.nome}
                        </Text>
                        <Text style={cm.cartItemCateg}>{produto.categoria}</Text>
                      </View>
                      <Text style={cm.cartQty}>x{qty}</Text>
                      <Text style={cm.cartPrice}>
                        {(produto.preco * qty).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </Text>
                      <TouchableOpacity onPress={() => removeFromCart(produto.id)} style={cm.trashBtn}>
                        <Ionicons name="trash-outline" size={16} color={Colors.textTertiary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                <View style={cm.totalRow}>
                  <Text style={cm.totalLabel}>TOTAL</Text>
                  <Text style={cm.totalValue}>
                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </Text>
                </View>

                <TouchableOpacity style={cm.checkoutBtn} activeOpacity={0.85}>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                  <Text style={cm.checkoutText}>Finalizar pedido</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.4 },
  headerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 1 },

  cartBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowRadius: 14, shadowOpacity: 0.4, elevation: 6,
  },
  cartBadge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: '#FFF', borderRadius: 9,
    width: 18, height: 18, alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.primary },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.textTertiary,
    letterSpacing: 1.2, paddingHorizontal: 20, paddingBottom: 10,
  },

  scroll: { paddingHorizontal: 16, gap: 16 },

  lojaCard: {
    backgroundColor: Colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.glassBorder,
    overflow: 'hidden',
    shadowColor: '#000', shadowRadius: 10, shadowOpacity: 0.25, elevation: 5,
  },
  lojaStrip: { height: 3, backgroundColor: Colors.primary },
  lojaHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, paddingBottom: 12,
  },
  lojaIconCircle: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: Colors.primary + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  lojaNome: { fontSize: 17, fontWeight: '700', color: Colors.text },
  lojaSub: { fontSize: 12, color: Colors.textTertiary, marginTop: 1 },
  lojaRightChip: { flexDirection: 'row', alignItems: 'center' },
  lojaRatingText: { fontSize: 12, fontWeight: '700', color: Colors.primary2 },

  productGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 12, paddingBottom: 14,
  },
  productCard: {
    width: '48%', backgroundColor: Colors.surfaceElevated, borderRadius: 12,
    padding: 12, gap: 8,
    borderWidth: 1, borderColor: Colors.glassBorder,
  },
  productCardInner: { flex: 1, gap: 4 },
  productCateg: {
    fontSize: 10, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.8,
  },
  productNome: { fontSize: 13, fontWeight: '700', color: Colors.text, lineHeight: 17 },
  productPreco: { fontSize: 16, fontWeight: '800', color: Colors.primary, marginTop: 4 },
  addCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-end',
  },

  fab: {
    position: 'absolute', bottom: 28, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowRadius: 16, shadowOpacity: 0.45, elevation: 10,
  },
  fabBadge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: '#FFF', borderRadius: 10,
    width: 20, height: 20, alignItems: 'center', justifyContent: 'center',
  },
  fabBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.primary },
});

const cm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingTop: 16, paddingBottom: 40,
    maxHeight: '85%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.glassBorder, alignSelf: 'center', marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingBottom: 16,
  },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },

  empty: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textSecondary },
  emptySub: { fontSize: 13, color: Colors.textTertiary, textAlign: 'center' },

  list: { paddingHorizontal: 24, gap: 4, paddingBottom: 16 },
  cartRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.glassBorder,
  },
  cartDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary,
  },
  cartItemName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  cartItemCateg: { fontSize: 11, color: Colors.textTertiary, marginTop: 1 },
  cartQty: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  cartPrice: { fontSize: 14, fontWeight: '700', color: Colors.primary2 },
  trashBtn: { padding: 4 },

  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: Colors.glassBorder,
  },
  totalLabel: { fontSize: 12, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 1 },
  totalValue: { fontSize: 24, fontWeight: '800', color: Colors.text },

  checkoutBtn: {
    marginHorizontal: 24, backgroundColor: Colors.primary, borderRadius: 16,
    padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowRadius: 14, shadowOpacity: 0.35, elevation: 6,
  },
  checkoutText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
