# FutuRoute AI operasyon kapısı

Bu dosya uygulama kodunun dışındaki, pilot öncesi zorunlu model sunucusu işlerini tanımlar. Depo, uzak `yz.gamehost.dev` sunucusunu kendi başına değiştirmez.

## Zorunlu yayın sırası

1. `docs/ai-inference-proxy.nginx.conf` içindeki token, TLS sertifikası ve upstream adresini ortamınıza göre değiştirin.
2. Servis Bearer kimlik doğrulaması kullanıyorsa uygulamadaki `AI_API_KEY` ile proxy tokenını aynı gizli değer olarak secret manager üzerinden sağlayın. Tokensiz servis kullanıyorsanız `AI_ALLOW_ANONYMOUS=true` değerini bilinçli olarak tanımlayın ve erişimi ağ katmanında sınırlandırın.
3. SGLang veya vLLM üzerinde prompt, response ve request-body loglamayı kapatın; JSON Schema desteğini doğrulayın.
4. Bearer korumalı kurulumda dış ağdan kimlik doğrulamasız `/v1/models` ve `/v1/chat/completions` isteklerinin 401/404 döndüğünü test edin. Tokensiz kurulumda yalnız izin verilen ağların inference servisine ulaşabildiğini doğrulayın.
5. `prisma migrate deploy` işini uygulama build’inden ayrı çalıştırın; ardından `npm run db:seed` ile doğrulanmış kataloğu eşitleyin.
6. Yatırımcı demosu için `AI_FEATURE_ENABLED=true` ve gerekirse `RIASEC_FEATURE_ENABLED=true` ayarlayın.
7. Gerçek öğrenci hesabını; aydınlatma/onay, uzman RIASEC dil doğrulaması ve veri saklama politikası tamamlanmadan açmayın.

## Hızlı doğrulama

Bearer korumalı kurulumda kimlik doğrulamasız model listesi ve inference erişimi başarısız olmalıdır. Tokensiz kurulumda erişim ağ politikasıyla uygulama sunucularına sınırlandırılmalıdır. Proxy veya model süreci ham prompt/yanıt kaydetmemelidir.
