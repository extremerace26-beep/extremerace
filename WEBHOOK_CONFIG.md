# Configuração do Webhook do Mercado Pago

## O que é o Webhook?

O webhook permite que o Mercado Pago notifique seu sistema automaticamente quando um pagamento é aprovado/rejeitado/pendente.

## Fluxo de Pagamento com Webhook

```
1. Usuário clica "Ir para pagamento"
2. Sistema cria inscrição no banco de dados (status: pending)
3. Usuário é redirecionado ao Mercado Pago
4. Usuário realiza o pagamento
5. Mercado Pago aprova o pagamento
6. Mercado Pago envia notificação ao webhook
7. Webhook atualiza status da inscrição para "paid"
8. Usuário é redirecionado de volta ao site
```

## Configuração do Webhook

### 1. No Mercado Pago

Acesse [Mercado Pago > Conta > Configurações > Webhooks](https://www.mercadopago.com.br/settings/account/notifications/webhooks)

Adicione:
- **URL**: `https://seu-site.netlify.app/.netlify/functions/mercadopago-webhook`
- **Evento**: `payment.success`, `payment.pending`, `payment.failure`

### 2. No Projeto

#### Edge Function (Supabase)

Arquivo: `supabase/functions/create-payment/index.ts`

Aceita os seguintes campos:
```typescript
{
  title: "Inscrição Extreme Race - Elite",
  quantity: 1,
  currency_id: "BRL",
  unit_price: 119.99,
  external_reference: "registro-id-123", // ID da inscrição
  registration_id: "registro-id-123",
  category_id: "elite",
  athlete_email: "user@email.com",
  athlete_name: "Fulano Silva",
  notification_url: "https://seu-site.netlify.app/.netlify/functions/mercadopago-webhook"
}
```

#### Webhook (Netlify Function)

Arquivo: `netlify/functions/mercadopago-webhook.js`

Recebe notificações do Mercado Pago e:
1. Valida o pagamento
2. Busca o ID da inscrição no `external_reference`
3. Atualiza o status para "paid"
4. Registra os detalhes do pagamento

## Testando o Webhook

### 1. Com URL Abreviada
Se usar a URL abreviada, ela precisa ter o webhook configurado manualmente no Mercado Pago.

### 2. Com Edge Function
Use a função `startCheckout()` do cliente que está em `src/lib/mercadopago.ts`

```typescript
const response = await startCheckout({
  title: `Inscrição Extreme Race - ${category.name}`,
  quantity: 1,
  currency_id: "BRL",
  unit_price: 119.99,
  external_reference: registration_id,
  athlete_email: athlete.email,
  athlete_name: athlete.fullName,
});
```

## Variáveis de Ambiente

```env
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxx
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-xxxxx
```

## Debugging

Verifique os logs:
- **Netlify**: Netlify > Site > Functions > `mercadopago-webhook`
- **Supabase**: Supabase > Edge Functions > `create-payment`

Procure por:
```
[Mercado Pago] webhook received
[Mercado Pago] payment status
[Mercado Pago] updating registration
[Mercado Pago] registration updated successfully
```

## Possíveis Problemas

### Webhook não recebe notificações
- Verifique se a URL está correta no Mercado Pago
- Verifique se o webhook está habilitado
- Verifique CORS headers

### Inscrição não atualiza para "paid"
- Verifique se `external_reference` é igual ao ID da inscrição
- Verifique se a tabela `registrations` tem o campo `payment_status`
- Verifique os logs do Netlify

### Erro de autenticação
- Verifique se `MERCADO_PAGO_ACCESS_TOKEN` está configurado
- Verifique se o token é válido
- Regenere o token se necessário no Mercado Pago
