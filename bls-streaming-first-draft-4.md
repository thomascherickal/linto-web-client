# Streaming
## Start streaming

### **Publish**
**Topic** : `clientCode/fromLinto/SN/streaming/start`

**Payload** : `{auth_token, config}`

**Payload info**
- *auth_token* : User token
- *config* : Optional,
(exemple `{"config": {"sample_rate":16000, "metadata":1 }}`)

### **Answer**
- **topic** : `clientCode/tolinto/sn/streaming/start`
- **payload** : `{"behavior":{"streaming":{"status" : "started"}}}`

## Send streaming chunk
### **Publish**

**Topic** : `clientCode/fromLinto/SN/streaming/chunk`

**Payload** : Buffer (sample rate : 16000hz, channel : 1 format : int 16)

### **Answer**
- **topic** : `clientCode/toLinto/SN/streaming/chunk`
- **payload**: `{behavior: { streaming : { partial: 'ne pas faire' }}}

## Stop streaming
### **Publish**

**Topic** : `clientCode/fromLinto/SN/streaming/stop`

**Payload** : `{auth_token}`

### **Answer**
- **topic** : `clientCode/toLinto/SN/streaming/stop`
- **payload** : 
```json

{"behavior":{
  "streaming": {
    "status" :"stop",  
    "text": "une journée est-ce que la transcrit pas faire ",
    "words": [
      { "conf": 0.664383, "end": 3.989363, "start": 3.840591, "word": "une" },
      { "conf": 0.600561, "end": 4.349945, "start": 3.990651, "word": "journée" },
      { "conf": 0.931991, "end": 5.399955, "start": 5.16098, "word": "est-ce" },
      { "conf": 0.978309, "end": 5.577856, "start": 5.399955, "word": "que" },
      { "conf": 0.57324, "end": 5.818935, "start": 5.579629, "word": "la" },
      { "conf": 0.671854, "end": 6.93, "start": 6.166314, "word": "transcrit" },
      { "conf": 0.688497, "end": 7.77, "start": 7.616895, "word": "pas" },
      { "conf": 0.57256, "end": 9.209825, "start": 8.88, "word": "faire" },
      { "conf": 0.402199, "end": 9.358705, "start": 9.211231, "word": "ma" },
    ],
    "speakers": [
      {
        "spk1": "jkhkjhkjh"
      }
    ]
}}}
```


## Error Format

```json
{"behavior":{
  "streaming": {
    "status" :"error",
    "message" : "An error text"
  }
}}  
```
