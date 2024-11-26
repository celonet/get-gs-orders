# GS CSV ORDER PROCESSOR

Gerar arquivo csv com a consulta do kibana <https://kibana-monitoria.prd-internal.gcp.gruposbf.com.br/app/r/s/nQlkG>

## Setup

Configure as variaveis de ambiente

```sh
cp env-example .env
```

Instale os pacotes

```sh
npm i ou npm install
```

## Executar script usando

```sh
node index.mjs --csvpath "{csv_filepath.csv}"
```

A saida será no terminal no formato

**Error to send ${orderData.product}: ${error.message} - ${error.response.data.message}`**
