import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

// Camembert SVG simple
function PieChart({ data }) {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return (
        <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 16 }}>
            Aucune tâche pour le moment.
        </Text>
    );

    const cx = 100, cy = 100, r = 80;
    let startAngle = -Math.PI / 2;
    const slices = data.filter(d => d.value > 0).map(d => {
        const angle = (d.value / total) * 2 * Math.PI;
        const endAngle = startAngle + angle;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const largeArc = angle > Math.PI ? 1 : 0;
        const midAngle = startAngle + angle / 2;
        const lx = cx + (r * 0.65) * Math.cos(midAngle);
        const ly = cy + (r * 0.65) * Math.sin(midAngle);
        const pct = Math.round((d.value / total) * 100);
        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        startAngle = endAngle;
        return { ...d, path, lx, ly, pct };
    });

    return (
        <View style={{ alignItems: 'center' }}>
            <Svg width={200} height={200} viewBox="0 0 200 200">
                <G>
                    {slices.map((s, i) => (
                        <G key={i}>
                            <Path d={s.path} fill={s.color} />
                            {s.pct > 8 && (
                                <SvgText
                                    x={s.lx} y={s.ly}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fontWeight="bold"
                                    fill="white"
                                >
                                    {s.pct}%
                                </SvgText>
                            )}
                        </G>
                    ))}
                </G>
            </Svg>

            {/* Légende */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 8 }}>
                {slices.map((s, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: s.color }} />
                        <Text style={{ fontSize: 12, color: '#64748b' }}>{s.name} ({s.value})</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default function DashboardScreen() {

    const { user } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        API.get('/dashboard/stats')
            .then(res => setStats(res.data))
            .catch(err => console.log(err));
    }, []);

    const pieData = stats ? [
        { name: 'À faire',  value: stats.todo     ?? 0, color: '#f59e0b' },
        { name: 'En cours', value: stats.progress  ?? 0, color: '#3b82f6' },
        { name: 'Terminé',  value: stats.done      ?? 0, color: '#10b981' },
    ] : [];

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView style={styles.container}>
                <Text style={styles.welcome}>Bonjour, {user?.nom} 👋</Text>
                <Text style={styles.role}>{user?.role}</Text>

                {stats && (
                    <>
                        {/* CARDS */}
                        <View style={styles.cardsRow}>
                            <View style={[styles.card, { borderLeftColor: '#3b82f6' }]}>
                                <Text style={styles.cardNum}>{stats.projects ?? 0}</Text>
                                <Text style={styles.cardLabel}>Projets</Text>
                            </View>
                            <View style={[styles.card, { borderLeftColor: '#64748b' }]}>
                                <Text style={styles.cardNum}>{(stats.todo ?? 0) + (stats.progress ?? 0) + (stats.done ?? 0)}</Text>
                                <Text style={styles.cardLabel}>Total tâches</Text>
                            </View>
                            <View style={[styles.card, { borderLeftColor: '#f59e0b' }]}>
                                <Text style={[styles.cardNum, { color: '#f59e0b' }]}>{stats.todo ?? 0}</Text>
                                <Text style={styles.cardLabel}>À faire</Text>
                            </View>
                            <View style={[styles.card, { borderLeftColor: '#3b82f6' }]}>
                                <Text style={[styles.cardNum, { color: '#3b82f6' }]}>{stats.progress ?? 0}</Text>
                                <Text style={styles.cardLabel}>En cours</Text>
                            </View>
                            <View style={[styles.card, { borderLeftColor: '#10b981' }]}>
                                <Text style={[styles.cardNum, { color: '#10b981' }]}>{stats.done ?? 0}</Text>
                                <Text style={styles.cardLabel}>Terminées</Text>
                            </View>
                        </View>

                        {/* GRAPHIQUE */}
                        <View style={styles.chartCard}>
                            <Text style={styles.chartTitle}>Répartition des tâches</Text>
                            <PieChart data={pieData} />
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#f8fafc' },
    container: { flex: 1, padding: 20 },
    welcome: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginTop: 16 },
    role: { fontSize: 14, color: '#64748b', marginBottom: 24, textTransform: 'capitalize' },
    cardsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
    card: {
        backgroundColor: 'white', borderRadius: 12, padding: 16,
        borderLeftWidth: 4, width: '47%',
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    cardNum: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
    cardLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
    chartCard: {
        backgroundColor: 'white', borderRadius: 12, padding: 20,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
        marginBottom: 20
    },
    chartTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 16 }
});