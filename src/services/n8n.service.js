// src/services/n8n.service.js
import axios from 'axios';

class N8NService {
	constructor() {
		this.webhookUrl = process.env.N8N_REFERRALS_WEBHOOK_URL;
	}

	/**
	 * Получает все данные рефералов из n8n (Google Sheets)
	 * @returns {Promise<Array>}
	 */
	async fetchAllReferrals() {
		try {
			if (!this.webhookUrl) {
				throw new Error('N8N_REFERRALS_WEBHOOK_URL is not defined in .env');
			}
			console.log(`🌐 Fetching referrals from n8n: ${this.webhookUrl}...`);
			const response = await axios.get(this.webhookUrl);
			
			const rawData = Array.isArray(response.data) ? response.data : [];
			console.log(`📊 Received ${rawData.length} rows from n8n`);
			
			return this.mapFields(rawData);
		} catch (error) {
			console.error("❌ Error fetching from n8n:", error.message);
			return [];
		}
	}

	/**
	 * Маппинг полей из Google Sheets в формат приложения
	 * Механика channel_activity сохранена для совместимости с фронтендом
	 */
	mapFields(data) {
		return data.map(item => {
			const activeStr = String(item.clubActive || '').toLowerCase().trim();
			
			let clubActiveVal = item.clubActive || ''; // Сохраняем оригинальное значение по умолчанию
			
			if (activeStr === 'yes' || activeStr === 'да' || activeStr === 'true' || activeStr === '1') {
				clubActiveVal = 'Да';
			} else if (activeStr === 'no' || activeStr === 'нет' || activeStr === 'false' || activeStr === '0') {
				clubActiveVal = 'Нет';
			}

			return {
				referal_id: String(item.referalId || item.referal_id || ''),
				referer_id: (item.parentId || item.referer_id) ? String(item.parentId || item.referer_id) : null,
				reg_date: item.regDate || item.reg_date,
				referal_nickname: item.referalNickname || item.referal_nickname || '',
				referer_nickname: item.refererNickname || item.referer_nickname || '',
				referal_name: item.referalName || item.referal_name || '',
				
				// Сохраняем логику channel_activity, чтобы фронтенд-механика (script.js) не сломалась
				channel_activity: clubActiveVal === 'Да' ? 'Да' : 'Неактивен',
				
				// Новые поля (отправляются на фронт для таблицы)
				club_active: clubActiveVal,
				review_count: parseInt(item.review) || 0,
				invitation_count: parseInt(item.invitation) || 0,
				end_sub: item.endSub || ''
			};
		});
	}

	buildTree(flatList, rootId = null, depth = 10, currentDepth = 1) {
		if (currentDepth > depth) return [];

		const children = flatList.filter(item => {
			if (rootId === null) {
				return !item.referer_id || item.referer_id === 'null' || item.referer_id === '';
			}
			return String(item.referer_id) === String(rootId);
		});

		return children.map(child => {
			const subTree = this.buildTree(flatList, child.referal_id, depth, currentDepth + 1);
			return {
				...child,
				children: subTree,
				totalReferals: this.countDescendants(subTree)
			};
		});
	}

	countDescendants(children) {
		let count = 0;
		for (const child of children) {
			count += 1 + (child.totalReferals || 0);
		}
		return count;
	}

	async getAllReferralsTree() {
		const flatList = await this.fetchAllReferrals();
		return this.buildTree(flatList);
	}

	async getUserReferralsTree(referalId) {
		const flatList = await this.fetchAllReferrals();
		const user = flatList.find(u => String(u.referal_id) === String(referalId));
		if (!user) return [];
		return this.buildTree(flatList, referalId);
	}

	async getActivityStats() {
		const flatList = await this.fetchAllReferrals();
		const total = flatList.length;
		const active = flatList.filter(u => u.channel_activity !== 'Неактивен').length;
		return { active, inactive: total - active, total };
	}

	async getUserActivityStats(referalId) {
		const flatList = await this.fetchAllReferrals();
		const userTree = this.buildTree(flatList, referalId);
		
		const stats = { active: 0, inactive: 0, total: 0 };
		const traverse = (nodes) => {
			for (const node of nodes) {
				stats.total++;
				if (node.channel_activity !== 'Неактивен') stats.active++;
				else stats.inactive++;
				if (node.children) traverse(node.children);
			}
		};
		traverse(userTree);
		return stats;
	}
}

export default new N8NService();
