import { Start, Update, On, InjectBot } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';

@Update()
export class AppUpdate {
  private readonly CHANNEL_USERNAME = 'https://t.me/suitcas'; 

  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  @Start()
  async onStart(ctx: Context) {
    const userName = ctx.from?.first_name || 'Foydalanuvchi';

    await ctx.replyWithHTML(
      `<b>Salom ${userName}!</b> 👋\n` +
        `Botimizga xush kelibsiz!\n\n` +
        `Botdan foydalanish uchun kanalimizga obuna bo'ling:`,
    );

    await ctx.reply(
      "Quyidagi tugma orqali kanalga o'ting va obuna bo'ling:",
      Markup.inlineKeyboard([
        Markup.button.url(
          "Kanalga o'tish ➡️",
          `https://t.me/${this.CHANNEL_USERNAME}`,
        ),
        Markup.button.callback('Tekshirish ✅', 'check_subscription'),
      ]),
    );
  }

  public async sendOrderToTelegram(order: any) {
    let message = `🛒 <b>Yangi buyurtma!</b>\n\n`;
    message += `🆔 ID: ${order.id}\n`;
    message += `📍 Manzil: ${order.address}\n`;
    message += `📅 Sana: ${new Date(order.date).toLocaleString()}\n`;
    message += `💵 To'lov turi: ${order.paymentType}\n`;
    message += `🚚 Yetkazib berish: ${order.withDelivery ? 'Ha' : 'Yo‘q'}\n`;
    message += `💬 Izoh: ${order.commentToDelivery || 'Yo‘q'}\n`;
    message += `💰 Jami summa: ${order.total} so‘m\n\n`;

    if (order.orderProducts?.length) {
      message += `📦 Mahsulotlar:\n`;
      order.orderProducts.forEach((p) => {
        message += `- ${p.Product.name} (${p.count} dona, ${p.measure}): ${p.price} so‘m\n`;
      });
      message += '\n';
    }

    if (order.orderTools?.length) {
      message += `🛠 Asboblar:\n`;
      order.orderTools.forEach((t) => {
        message += `- ${t.Tool.name} (${t.count} dona)\n`;
      });
      message += '\n';
    }

    if (order.masters?.length) {
      message += `👨‍🔧 Ustalar:\n`;
      order.masters.forEach((m) => {
        const master = m.Master;
        message += `- ${master.name} (${master.phone}) ⭐️ ${master.star || 0}\n`;
      });
    }

    try {
      console.log('Yuborilmoqda');
      const chatId = `@${this.CHANNEL_USERNAME}`;
      await this.bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'HTML',
      });
      console.log("Yuborildi");
    } catch (err) {
      console.error('Foydalanuvchiga yuborishda xatolik:', err.message);
    }
  }

  @On('callback_query')
  async onCallbackQuery(ctx: Context) {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    if (ctx.callbackQuery.data === 'check_subscription') {
      try {
        if (!ctx.from) {
          await ctx.answerCbQuery("Foydalanuvchi ma'lumotlari topilmadi");
          return;
        }

        const member = await ctx.telegram.getChatMember(
          `@${this.CHANNEL_USERNAME}`,
          ctx.from.id,
        );

        if (['member', 'administrator', 'creator'].includes(member.status)) {
          await ctx.answerCbQuery("Rahmat! Obuna bo'lganingiz uchun ✅");
          await ctx
            .deleteMessage()
            .catch((e) => console.log('Delete error:', e));
          await ctx.reply("Endi botdan to'liq foydalanishingiz mumkin!");
        } else {
          await ctx.answerCbQuery("⚠️ Siz hali obuna bo'lmagansiz!");
        }
      } catch (error) {
        console.error('Subscription check error:', error);
        await ctx.answerCbQuery(
          `Xatolik yuz berdi: ${error.message}\nIltimos, botni kanalda admin qiling.`,
        );
      }
    }
  }
}
