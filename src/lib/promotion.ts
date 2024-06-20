import type { Key, Piece } from 'chessground/types';

const promotion_roles = ['queen', 'rook', 'bishop', 'knight'] as const;
type PromotionRole = (typeof promotion_roles)[number];

const is_promotion = (tile: Key, piece: Piece) => {
	if (piece.role !== 'pawn') {
		return false;
	}

	const rank = parseInt(tile.charAt(1));
	const promotion_rank = piece.color === 'white' ? 8 : 1;
	const is_promotion = promotion_rank === rank;

	return is_promotion;
};

export { promotion_roles, is_promotion };
export type { PromotionRole };
