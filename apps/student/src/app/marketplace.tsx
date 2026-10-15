// MarketplaceView — faithful port of Views/Marketplace/MarketplaceView.swift
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Modal,
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

  return (
    <SafeAreaView style={s.safe}>
      {/* Toolbar cart */}
      <View style={s.toolbar}>
        <Text style={s.toolbarTitle}>Parceiros</Text>
        <TouchableOpacity onPress={() => setShowCarrinho(true)} style={s.cartBtn}>
          <Ionicons name="cart" size={22} color={Colors.primary} />
          {carrinho.length > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{carrinho.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {mockLojas.map(loja => (
          <View key={loja.id} style={s.lojaSection}>
            <View style={s.lojaHeader}>
              <Ionicons name={loja.logoIcon as any} size={20} color={Colors.primary2} />
              <Text style={s.lojaNome}>{loja.nome}</Text>
            </View>
            {loja.produtos.map(produto => (
              <View key={produto.id} style={s.produtoRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.produtoNome}>{produto.nome}</Text>
                  <Text style={s.produtoCateg}>{produto.categoria}</Text>
                </View>
                <Text style={s.produtoPreco}>
                  {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Text>
                <TouchableOpacity
                  onPress={() => addToCart(produto)}
                  style={s.addBtn}
                >
                  <Ionicons name="cart" size={16} color={Colors.primary} />
                  <Ionicons name="add" size={12} color={Colors.primary} style={{ marginLeft: -4 }} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Cart modal */}
      <Modal visible={showCarrinho} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
          <View style={s.toolbar}>
            <Text style={s.toolbarTitle}>Carrinho</Text>
            <TouchableOpacity onPress={() => setShowCarrinho(false)}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.scroll}>
            {carrinho.length === 0 ? (
              <View style={s.empty}>
                <Ionicons name="cart-outline" size={48} color={Colors.textTertiary} />
                <Text style={s.emptyText}>Carrinho vazio</Text>
              </View>
            ) : (
              <>
                {carrinho.map((item, idx) => (
                  <View key={`${item.id}-${idx}`} style={s.cartRow}>
                    <Text style={{ flex: 1, color: Colors.text, fontSize: 14 }}>{item.nome}</Text>
                    <Text style={s.produtoPreco}>
                      {item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Text>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                      <Ionicons name="trash-outline" size={18} color={Colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={[s.cartRow, { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 14 }]}>
                  <Text style={{ flex: 1, fontWeight: '700', color: Colors.text, fontSize: 16 }}>Total</Text>
                  <Text style={[s.produtoPreco, { fontSize: 18 }]}>
                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </Text>
                </View>
                <TouchableOpacity style={s.checkoutBtn}>
                  <Text style={s.checkoutText}>Finalizar pedido (mock)</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  toolbarTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  cartBtn: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: Colors.primary, borderRadius: 8,
    width: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: 10, color: '#FFF', fontWeight: '700' },
  scroll: { padding: 16, gap: 16, paddingBottom: 32 },
  lojaSection: {
    backgroundColor: Colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.glassBorder, overflow: 'hidden',
  },
  lojaHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 14, backgroundColor: Colors.surfaceElevated,
  },
  lojaNome: { fontSize: 15, fontWeight: '700', color: Colors.text },
  produtoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  produtoNome: { fontSize: 14, color: Colors.text, marginBottom: 2 },
  produtoCateg: { fontSize: 12, color: Colors.textTertiary },
  produtoPreco: { fontSize: 14, fontWeight: '700', color: Colors.text },
  addBtn: {
    backgroundColor: Colors.primary + '22', borderRadius: 8,
    padding: 8, flexDirection: 'row', alignItems: 'center',
  },
  cartRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: Colors.textTertiary, fontSize: 16 },
  checkoutBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 8,
  },
  checkoutText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
