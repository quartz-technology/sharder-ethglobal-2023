export const USER_HAS_XMTP_RESOLVER = `
query MyQuery($address: Identity!) {
  XMTPs(input: {blockchain: ALL, filter: {owner: {_eq: $address}}}) {
    XMTP {
      isXMTPEnabled
    }
  }
}`

export type AirstackResolvedXMTP = {
    XMTPs: {
        XMTP: {
            isXMTPEnabled: boolean,
        }[] | null,
    } | null,
}