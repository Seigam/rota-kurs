# FutuRoute AI operasyon kapısı

Bu dosya uygulama kodunun dışındaki, pilot öncesi zorunlu model sunucusu işlerini tanımlar. Depo, uzak `yz.gamehost.dev` sunucusunu kendi başına değiştirmez.

## Zorunlu yayın sırası

1. `docs/ai-inference-proxy.nginx.conf` içindeki token, TLS sertifikası ve upstream adresini ortamınıza göre değiştirin.
2. Uygulamadaki `AI_API_KEY` ile proxy tokenını aynı gizli değer olarak secret manager üzerinden sağlayın.
3. SGLang veya vLLM üzerinde prompt, response ve request-body loglamayı kapatın; JSON Schema desteğini doğrulayın.
4. Dış ağdan kimlik doğrulamasız `/v1/models` ve `/v1/chat/completions` isteklerinin 401/404 döndüğünü test edin.
5. `prisma migrate deploy` işini uygulama build’inden ayrı çalıştırın; ardından `npm run db:seed` ile doğrulanmış kataloğu eşitleyin.
6. Yatırımcı demosu için `AI_FEATURE_ENABLED=true` ve gerekirse `RIASEC_FEATURE_ENABLED=true` ayarlayın.
7. Gerçek öğrenci hesabını; aydınlatma/onay, uzman RIASEC dil doğrulaması ve veri saklama politikası tamamlanmadan açmayın.

## Hızlı doğrulama

Kimlik doğrulamasız model listesi ve inference erişimi başarısız olmalıdır. Yetkili inference isteği yalnız uygulama sunucusundan gitmeli, 20 saniyeyi aşan upstream istekleri kesilmelidir. Proxy veya model süreci ham prompt/yanıt kaydetmemelidir.
