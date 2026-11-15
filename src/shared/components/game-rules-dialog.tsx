"use client";

import { useTranslations } from "next-intl";
import { type PortalProps } from "@/shared/types/portal.types";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { XiangqiPieceComponent } from "@/features/xiangqi/components/xiangqi-piece";
import { XiangqiColor, XiangqiPieceType } from "@/features/xiangqi/types";
import { CaroPieceMark } from "@/features/caro/components/caro-piece-mark";
import { CaroPlayer } from "@/features/caro/types";
import { BidaBallItem } from "@/features/bida/components/bida-ball-item";

export interface GameRulesDialogData {
  gameType: "xiangqi" | "caro" | "bida" | "tictactoe" | "chess" | "animal-chess";
  gameTitle?: string;
}

export function GameRulesDialog({
  isOpen,
  onDismiss,
  data,
}: PortalProps<GameRulesDialogData>) {
  const tCommon = useTranslations("common");

  if (!data) return null;

  const { gameType, gameTitle } = data;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss?.()}>
      <DialogContent showCloseButton={true} className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {/* Lead game visual element instead of arbitrary generic icons */}
            {gameType === "xiangqi" && (
              <XiangqiPieceComponent
                type={XiangqiPieceType.GENERAL}
                color={XiangqiColor.RED}
                size="md"
                interactive={false}
              />
            )}
            {gameType === "caro" && (
              <div className="w-9 h-9 rounded-2xl bg-secondary/70 flex items-center justify-center shrink-0">
                <CaroPieceMark value={CaroPlayer.X} size="sm" />
              </div>
            )}
            {gameType === "bida" && (
              <div className="w-9 h-9 rounded-2xl bg-secondary/70 flex items-center justify-center shrink-0">
                <BidaBallItem id={8} size="sm" />
              </div>
            )}

            <div className="flex flex-col text-left">
              <DialogTitle className="text-base sm:text-lg font-black tracking-tight">
                {gameTitle || (gameType === "xiangqi" ? "Cờ Tướng" : gameType === "caro" ? "Cờ Caro" : "Bida 8 Bóng")}
              </DialogTitle>
              <p className="text-xs text-muted-foreground font-medium">
                {gameType === "xiangqi"
                  ? "Hướng dẫn chi tiết luật di chuyển từng quân & điều kiện thắng thua"
                  : gameType === "caro"
                  ? "Quy tắc 5 quân liên tiếp và các thế cờ hòa"
                  : "Quy tắc phá bóng, phân nhóm và điều kiện ăn bi 8"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body according to gameType - Clean surface layout without generic iconography */}
        <div className="space-y-4 my-3">
          {gameType === "xiangqi" && (
            <>
              {/* Piece Visual Reference Table */}
              <div className="p-4 rounded-2xl bg-muted/50 space-y-3">
                <div className="font-black text-xs sm:text-sm text-foreground">
                  Bảng Quân Cờ & Cách Di Chuyển
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-background/60">
                    <XiangqiPieceComponent
                      type={XiangqiPieceType.GENERAL}
                      color={XiangqiColor.RED}
                      size="sm"
                      interactive={false}
                    />
                    <div className="text-[11px] leading-snug">
                      <strong className="text-foreground block">Tướng (帥/將)</strong>
                      <span className="text-muted-foreground">Đi ngang/dọc 1 ô trong Cung 3x3. Cấm lộ mặt Tướng.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-background/60">
                    <XiangqiPieceComponent
                      type={XiangqiPieceType.ADVISOR}
                      color={XiangqiColor.RED}
                      size="sm"
                      interactive={false}
                    />
                    <div className="text-[11px] leading-snug">
                      <strong className="text-foreground block">Sĩ (仕/士)</strong>
                      <span className="text-muted-foreground">Đi chéo 1 ô trong Cung 3x3 để hộ vệ Tướng.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-background/60">
                    <XiangqiPieceComponent
                      type={XiangqiPieceType.ELEPHANT}
                      color={XiangqiColor.RED}
                      size="sm"
                      interactive={false}
                    />
                    <div className="text-[11px] leading-snug">
                      <strong className="text-foreground block">Tượng (相/象)</strong>
                      <span className="text-muted-foreground">Đi chéo 2 ô (ô mắt), không qua sông, bị cản nếu mắt có quân.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-background/60">
                    <XiangqiPieceComponent
                      type={XiangqiPieceType.HORSE}
                      color={XiangqiColor.RED}
                      size="sm"
                      interactive={false}
                    />
                    <div className="text-[11px] leading-snug">
                      <strong className="text-foreground block">Mã (傌/馬)</strong>
                      <span className="text-muted-foreground">Đi chữ L (1 thẳng + 1 chéo). Bị cản khi có quân đứng ở chân mã.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-background/60">
                    <XiangqiPieceComponent
                      type={XiangqiPieceType.CHARIOT}
                      color={XiangqiColor.RED}
                      size="sm"
                      interactive={false}
                    />
                    <div className="text-[11px] leading-snug">
                      <strong className="text-foreground block">Xe (俥/車)</strong>
                      <span className="text-muted-foreground">Đi ngang/dọc không hạn chế cự ly khi đường trống. Quân mạnh nhất.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-background/60">
                    <XiangqiPieceComponent
                      type={XiangqiPieceType.CANNON}
                      color={XiangqiColor.RED}
                      size="sm"
                      interactive={false}
                    />
                    <div className="text-[11px] leading-snug">
                      <strong className="text-foreground block">Pháo (炮/砲)</strong>
                      <span className="text-muted-foreground">Di chuyển như Xe; khi ăn quân bắt buộc phải nhảy qua đúng 1 quân cản (ngòi).</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-background/60 col-span-1 sm:col-span-2">
                    <XiangqiPieceComponent
                      type={XiangqiPieceType.SOLDIER}
                      color={XiangqiColor.RED}
                      size="sm"
                      interactive={false}
                    />
                    <div className="text-[11px] leading-snug">
                      <strong className="text-foreground block">Tốt / Binh (兵/卒)</strong>
                      <span className="text-muted-foreground">Trước khi qua sông chỉ tiến thẳng 1 ô. Sau khi qua sông được tiến hoặc đi ngang 1 ô (không được đi lùi).</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Rules Card */}
              <div className="p-4 rounded-2xl bg-muted/50 space-y-2.5">
                <div className="font-black text-xs sm:text-sm text-foreground">
                  Luật Kết Thúc & Điều Kiện Thắng/Thua
                </div>
                <ul className="space-y-1.5 pl-4 list-disc text-xs text-muted-foreground leading-relaxed">
                  <li>
                    <strong className="text-foreground">Chiếu bí (Checkmate):</strong> Khi Tướng bị chiếu và không còn bất kỳ nước đi nào để cứu thoát $\rightarrow$ Thua cuộc.
                  </li>
                  <li>
                    <strong className="text-foreground">Vây bí / Hết nước đi (Stalemate):</strong> Người chơi đến lượt không bị chiếu nhưng không còn nước đi hợp lệ trên toàn bàn cờ $\rightarrow$ <strong className="text-rose-500">Bị xử THUA</strong> (theo luật Cờ tướng chính thống).
                  </li>
                  <li>
                    <strong className="text-foreground">Cấm lộ mặt Tướng (Flying General):</strong> Hai Tướng không được nằm đối diện nhau trên cùng một cột mà không có quân nào ở giữa che chắn. Nước đi làm lộ mặt Tướng là bất hợp pháp.
                  </li>
                </ul>
              </div>
            </>
          )}

          {gameType === "caro" && (
            <>
              {/* Visual Piece Card */}
              <div className="p-4 rounded-2xl bg-muted/50 space-y-3">
                <div className="font-black text-xs sm:text-sm text-foreground">
                  Ký Hiệu Người Chơi & Bàn Đấu
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60">
                    <CaroPieceMark value={CaroPlayer.X} size="md" />
                    <div>
                      <strong className="text-xs text-foreground block">Người chơi X (Tiên)</strong>
                      <span className="text-[11px] text-muted-foreground">Chủ phòng đi trước, quân màu Xanh neon.</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60">
                    <CaroPieceMark value={CaroPlayer.O} size="md" />
                    <div>
                      <strong className="text-xs text-foreground block">Người chơi O (Hậu)</strong>
                      <span className="text-[11px] text-muted-foreground">Đối thủ đi sau, quân màu Đỏ hồng.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rules Card */}
              <div className="p-4 rounded-2xl bg-muted/50 space-y-2.5">
                <div className="font-black text-xs sm:text-sm text-foreground">
                  Quy Tắc Thắng & Hòa
                </div>
                <ul className="space-y-1.5 pl-4 list-disc text-xs text-muted-foreground leading-relaxed">
                  <li>
                    <strong className="text-foreground">5 quân liên tiếp:</strong> Người đầu tiên xếp được đúng 5 quân cờ liên tục theo hàng ngang, hàng dọc hoặc đường chéo $\rightarrow$ Chiến Thắng.
                  </li>
                  <li>
                    <strong className="text-foreground">Chặn 2 đầu:</strong> Nếu chuỗi 5 quân bị đối thủ chặn cả 2 đầu ngoài cùng, thế cờ vẫn được tính thắng nếu đạt đủ 5 quân.
                  </li>
                  <li>
                    <strong className="text-foreground">Hòa cờ:</strong> Khi tất cả 225 ô trên bàn 15x15 đã được lấp đầy mà chưa bên nào đạt 5 quân liên tiếp $\rightarrow$ Trận đấu kết thúc với kết quả Hòa.
                  </li>
                </ul>
              </div>
            </>
          )}

          {gameType === "bida" && (
            <>
              {/* Ball Groups Visual */}
              <div className="p-4 rounded-2xl bg-muted/50 space-y-3">
                <div className="font-black text-xs sm:text-sm text-foreground">
                  Các Nhóm Bi Trên Bàn
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background/60">
                    <div className="flex items-center gap-1 shrink-0">
                      <BidaBallItem id={1} size="sm" />
                      <BidaBallItem id={3} size="sm" />
                      <BidaBallItem id={7} size="sm" />
                    </div>
                    <div className="text-[11px]">
                      <strong className="text-foreground block">Bi Trơn (Solids #1 - #7)</strong>
                      <span className="text-muted-foreground">Bi một màu đặc, số từ 1 đến 7.</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background/60">
                    <div className="flex items-center gap-1 shrink-0">
                      <BidaBallItem id={9} size="sm" />
                      <BidaBallItem id={11} size="sm" />
                      <BidaBallItem id={15} size="sm" />
                    </div>
                    <div className="text-[11px]">
                      <strong className="text-foreground block">Bi Sọc (Stripes #9 - #15)</strong>
                      <span className="text-muted-foreground">Bi có vạch sọc trắng giữa, số từ 9 đến 15.</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background/60">
                    <BidaBallItem id={8} size="sm" className="shrink-0" />
                    <div className="text-[11px]">
                      <strong className="text-foreground block">Bi 8 Đen (8-Ball)</strong>
                      <span className="text-muted-foreground">Bi quyết định trận đấu. Chỉ ăn SAU KHI đã dọn sạch toàn bộ bi của nhóm mình.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Foul and 8-Ball Rules */}
              <div className="p-4 rounded-2xl bg-muted/50 space-y-2.5">
                <div className="font-black text-xs sm:text-sm text-foreground">
                  Các Quy Tắc Quyết Định Thắng Thua
                </div>
                <ul className="space-y-1.5 pl-4 list-disc text-xs text-muted-foreground leading-relaxed">
                  <li>
                    <strong className="text-foreground">Lỗi Bi Cái (Scratch):</strong> Bi cái rơi vào lỗ $\rightarrow$ Đổi lượt, đối thủ nhận bi trong tay (Ball-in-hand) đặt bất kỳ đâu.
                  </li>
                  <li>
                    <strong className="text-rose-500">Xử Thua Ngay:</strong> Ăn bi 8 khi vẫn còn bi của nhóm mình trên bàn.
                  </li>
                  <li>
                    <strong className="text-rose-500">Xử Thua Ngay:</strong> Ăn bi 8 đồng thời làm rơi bi cái vào lỗ trong cùng cú đánh.
                  </li>
                  <li>
                    <strong className="text-emerald-500">Chiến Thắng:</strong> Dọn sạch toàn bộ 7 bi nhóm mình và ăn bi 8 vào lỗ hợp lệ.
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onDismiss?.()}
            className="w-full sm:w-auto px-6 text-xs font-bold"
          >
            {tCommon("understand")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
