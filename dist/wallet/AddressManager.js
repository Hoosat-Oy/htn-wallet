export class AddressManager {
    constructor(HDWallet, network) {
        /**
         * Derives a new receive address. Sets related instance properties.
         */
        this.receiveAddress = {
            counter: 0,
            // @ts-ignore
            current: {},
            keypairs: {},
            atIndex: {},
            next: () => {
                const { address, privateKey } = this.deriveAddress('receive', this.receiveAddress.counter);
                this.receiveAddress.current = { address, privateKey };
                this.receiveAddress.keypairs[address] = privateKey;
                this.receiveAddress.atIndex[this.receiveAddress.counter] = address;
                this.receiveAddress.counter += 1;
                return address;
            },
            advance(n) {
                this.counter = n;
                this.next();
            },
        };
        /**
         * Derives a new change address. Sets related instance properties.
         */
        this.changeAddress = {
            counter: 0,
            // @ts-ignore
            current: {},
            keypairs: {},
            atIndex: {},
            next: () => {
                const { address, privateKey } = this.deriveAddress('change', this.changeAddress.counter);
                this.changeAddress.keypairs[address] = privateKey;
                this.changeAddress.current = { address, privateKey };
                this.changeAddress.atIndex[this.changeAddress.counter] = address;
                this.changeAddress.counter += 1;
                return address;
            },
            advance(n) {
                this.counter = n;
                // no call to next() here; composeTx calls it on demand.
            },
            reverse() {
                this.counter -= 1;
            },
        };
        this.HDWallet = HDWallet;
        this.network = network;
    }
    get all() {
        return Object.assign(Object.assign({}, this.receiveAddress.keypairs), this.changeAddress.keypairs);
    }
    get shouldFetch() {
        const receive = Object.entries(this.receiveAddress.atIndex)
            .filter((record) => parseInt(record[0], 10) <= this.receiveAddress.counter - 1)
            .map((record) => record[1]);
        const change = Object.entries(this.changeAddress.atIndex)
            .filter((record) => parseInt(record[0], 10) <= this.changeAddress.counter)
            .map((record) => record[1]);
        return [...receive, ...change];
    }
    deriveAddress(deriveType, index) {
        const dType = deriveType === 'receive' ? 0 : 1;
        const { privateKey } = this.HDWallet.deriveChild(`m/44'/972/0'/${dType}'/${index}'`);
        return {
            address: privateKey.toAddress(this.network).toString(),
            privateKey,
        };
    }
    /**
     * Derives n addresses and adds their keypairs to their deriveType-respective address object
     * @param n How many addresses to derive
     * @param deriveType receive or change address
     * @param offset Index to start at in derive path
     */
    getAddresses(n, deriveType, offset = 0) {
        return [...Array(n).keys()].map((i) => {
            const index = i + offset;
            const { address, privateKey } = this.deriveAddress(deriveType, index);
            if (deriveType === 'receive') {
                this.receiveAddress.atIndex[index] = address;
                this.receiveAddress.keypairs[address] = privateKey;
            }
            else {
                this.changeAddress.atIndex[index] = address;
                this.changeAddress.keypairs[address] = privateKey;
            }
            return {
                index,
                address,
                privateKey,
            };
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRkcmVzc01hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi93YWxsZXQvQWRkcmVzc01hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsTUFBTSxPQUFPLGNBQWM7SUFDekIsWUFBWSxRQUE4QixFQUFFLE9BQWdCO1FBeUI1RDs7V0FFRztRQUNILG1CQUFjLEdBT1Y7WUFDRixPQUFPLEVBQUUsQ0FBQztZQUNWLGFBQWE7WUFDYixPQUFPLEVBQUUsRUFBRTtZQUNYLFFBQVEsRUFBRSxFQUFFO1lBQ1osT0FBTyxFQUFFLEVBQUU7WUFDWCxJQUFJLEVBQUUsR0FBVyxFQUFFO2dCQUNqQixNQUFNLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzNGLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxHQUFHLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDO2dCQUN0RCxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxVQUFVLENBQUM7Z0JBQ25ELElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsT0FBTyxDQUFDO2dCQUNuRSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLE9BQU8sT0FBTyxDQUFDO1lBQ2pCLENBQUM7WUFDRCxPQUFPLENBQUMsQ0FBUztnQkFDZixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztnQkFDakIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2QsQ0FBQztTQUNGLENBQUM7UUFFRjs7V0FFRztRQUNILGtCQUFhLEdBUVQ7WUFDRixPQUFPLEVBQUUsQ0FBQztZQUNWLGFBQWE7WUFDYixPQUFPLEVBQUUsRUFBRTtZ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LE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ3BDLE1BQU0sS0FBSyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUM7WUFDekIsTUFBTSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN0RSxJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQztnQkFDN0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsVUFBVSxDQUFDO2FBQ3BEO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQztnQkFDNUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsVUFBVSxDQUFDO2FBQ25EO1lBQ0QsT0FBTztnQkFDTCxLQUFLO2dCQUNMLE9BQU87Z0JBQ1AsVUFBVTthQUNYLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8vIEB0cy1pZ25vcmVcbmltcG9ydCBiaXRjb3JlIGZyb20gJ2JpdGNvcmUtbGliLWNhc2gnO1xuaW1wb3J0IHsgTmV0d29yayB9IGZyb20gJ2N1c3RvbS10eXBlcyc7XG5cbmV4cG9ydCBjbGFzcyBBZGRyZXNzTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKEhEV2FsbGV0OiBiaXRjb3JlLkhEUHJpdmF0ZUtleSwgbmV0d29yazogTmV0d29yaykge1xuICAgIHRoaXMuSERXYWxsZXQgPSBIRFdhbGxldDtcbiAgICB0aGlzLm5ldHdvcmsgPSBuZXR3b3JrO1xuICB9XG5cbiAgcHJpdmF0ZSBIRFdhbGxldDogYml0Y29yZS5IRFByaXZhdGVLZXk7XG5cbiAgbmV0d29yazogTmV0d29yaztcblxuICBnZXQgYWxsKCk6IFJlY29yZDxzdHJpbmcsIGJpdGNvcmUuUHJpdmF0ZUtleT4ge1xuICAgIHJldHVybiB7IC4uLnRoaXMucmVjZWl2ZUFkZHJlc3Mua2V5cGFpcnMsIC4uLnRoaXMuY2hhbmdlQWRkcmVzcy5rZXlwYWlycyB9O1xuICB9XG5cbiAgZ2V0IHNob3VsZEZldGNoKCk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCByZWNlaXZlID0gT2JqZWN0LmVudHJpZXModGhpcy5yZWNlaXZlQWRkcmVzcy5hdEluZGV4KVxuICAgICAgLmZpbHRlcihcbiAgICAgICAgKHJlY29yZDogW3N0cmluZywgc3RyaW5nXSkgPT4gcGFyc2VJbnQocmVjb3JkWzBdLCAxMCkgPD0gdGhpcy5yZWNlaXZlQWRkcmVzcy5jb3VudGVyIC0gMVxuICAgICAgKVxuICAgICAgLm1hcCgocmVjb3JkOiBbc3RyaW5nLCBzdHJpbmddKSA9PiByZWNvcmRbMV0pO1xuICAgIGNvbnN0IGNoYW5nZSA9IE9iamVjdC5lbnRyaWVzKHRoaXMuY2hhbmdlQWRkcmVzcy5hdEluZGV4KVxuICAgICAgLmZpbHRlcigocmVjb3JkOiBbc3RyaW5nLCBzdHJpbmddKSA9PiBwYXJzZUludChyZWNvcmRbMF0sIDEwKSA8PSB0aGlzLmNoYW5nZUFkZHJlc3MuY291bnRlcilcbiAgICAgIC5tYXAoKHJlY29yZDogW3N0cmluZywgc3RyaW5nXSkgPT4gcmVjb3JkWzFdKTtcbiAgICByZXR1cm4gWy4uLnJlY2VpdmUsIC4uLmNoYW5nZV07XG4gIH1cblxuICAvKipcbiAgICogRGVyaXZlcyBhIG5ldyByZWNlaXZlIGFkZHJlc3MuIFNldHMgcmVsYXRlZCBpbnN0YW5jZSBwcm9wZXJ0aWVzLlxuICAgKi9cbiAgcmVjZWl2ZUFkZHJlc3M6IHtcbiAgICBjb3VudGVyOiBudW1iZXI7XG4gICAgY3VycmVudDogeyBhZGRyZXNzOiBzdHJpbmc7IHByaXZhdGVLZXk6IGJpdGNvcmUuUHJpdmF0ZUtleSB9O1xuICAgIGtleXBhaXJzOiBSZWNvcmQ8c3RyaW5nLCBiaXRjb3JlLlByaXZhdGVLZXk+O1xuICAgIGF0SW5kZXg6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gICAgbmV4dDogKCkgPT4gc3RyaW5nO1xuICAgIGFkdmFuY2U6IChuOiBudW1iZXIpID0+IHZvaWQ7XG4gIH0gPSB7XG4gICAgY291bnRlcjogMCxcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY3VycmVudDoge30sXG4gICAga2V5cGFpcnM6IHt9LFxuICAgIGF0SW5kZXg6IHt9LFxuICAgIG5leHQ6ICgpOiBzdHJpbmcgPT4ge1xuICAgICAgY29uc3QgeyBhZGRyZXNzLCBwcml2YXRlS2V5IH0gPSB0aGlzLmRlcml2ZUFkZHJlc3MoJ3JlY2VpdmUnLCB0aGlzLnJlY2VpdmVBZGRyZXNzLmNvdW50ZXIpO1xuICAgICAgdGhpcy5yZWNlaXZlQWRkcmVzcy5jdXJyZW50ID0geyBhZGRyZXNzLCBwcml2YXRlS2V5IH07XG4gICAgICB0aGlzLnJlY2VpdmVBZGRyZXNzLmtleXBhaXJzW2FkZHJlc3NdID0gcHJpdmF0ZUtleTtcbiAgICAgIHRoaXMucmVjZWl2ZUFkZHJlc3MuYXRJbmRleFt0aGlzLnJlY2VpdmVBZGRyZXNzLmNvdW50ZXJdID0gYWRkcmVzcztcbiAgICAgIHRoaXMucmVjZWl2ZUFkZHJlc3MuY291bnRlciArPSAxO1xuICAgICAgcmV0dXJuIGFkZHJlc3M7XG4gICAgfSxcbiAgICBhZHZhbmNlKG46IG51bWJlcik6IHZvaWQge1xuICAgICAgdGhpcy5jb3VudGVyID0gbjtcbiAgICAgIHRoaXMubmV4dCgpO1xuICAgIH0sXG4gIH07XG5cbiAgLyoqXG4gICAqIERlcml2ZXMgYSBuZXcgY2hhbmdlIGFkZHJlc3MuIFNldHMgcmVsYXRlZCBpbnN0YW5jZSBwcm9wZXJ0aWVzLlxuICAgKi9cbiAgY2hhbmdlQWRkcmVzczoge1xuICAgIGNvdW50ZXI6IG51bWJlcjtcbiAgICBjdXJyZW50OiB7IGFkZHJlc3M6IHN0cmluZzsgcHJpdmF0ZUtleTogYml0Y29yZS5Qcml2YXRlS2V5IH07XG4gICAga2V5cGFpcnM6IFJlY29yZDxzdHJpbmcsIGJpdGNvcmUuUHJpdmF0ZUtleT47XG4gICAgYXRJbmRleDogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgICBuZXh0OiAoKSA9PiBzdHJpbmc7XG4gICAgYWR2YW5jZTogKG46IG51bWJlcikgPT4gdm9pZDtcbiAgICByZXZlcnNlOiAoKSA9PiB2b2lkO1xuICB9ID0ge1xuICAgIGNvdW50ZXI6IDAsXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGN1cnJlbnQ6IHt9LFxuICAgIGtleXBhaXJzOiB7fSxcbiAgICBhdEluZGV4OiB7fSxcbiAgICBuZXh0OiAoKTogc3RyaW5nID0+IHtcbiAgICAgIGNvbnN0IHsgYWRkcmVzcywgcHJpdmF0ZUtleSB9ID0gdGhpcy5kZXJpdmVBZGRyZXNzKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZUFkZHJlc3MuY291bnRlcik7XG4gICAgICB0aGlzLmNoYW5nZUFkZHJlc3Mua2V5cGFpcnNbYWRkcmVzc10gPSBwcml2YXRlS2V5O1xuICAgICAgdGhpcy5jaGFuZ2VBZGRyZXNzLmN1cnJlbnQgPSB7IGFkZHJlc3MsIHByaXZhdGVLZXkgfTtcbiAgICAgIHRoaXMuY2hhbmdlQWRkcmVzcy5hdEluZGV4W3RoaXMuY2hhbmdlQWRkcmVzcy5jb3VudGVyXSA9IGFkZHJlc3M7XG4gICAgICB0aGlzLmNoYW5nZUFkZHJlc3MuY291bnRlciArPSAxO1xuICAgICAgcmV0dXJuIGFkZHJlc3M7XG4gICAgfSxcbiAgICBhZHZhbmNlKG46IG51bWJlcik6IHZvaWQge1xuICAgICAgdGhpcy5jb3VudGVyID0gbjtcbiAgICAgIC8vIG5vIGNhbGwgdG8gbmV4dCgpIGhlcmU7IGNvbXBvc2VUeCBjYWxscyBpdCBvbiBkZW1hbmQuXG4gICAgfSxcbiAgICByZXZlcnNlKCk6IHZvaWQge1xuICAgICAgdGhpcy5jb3VudGVyIC09IDE7XG4gICAgfSxcbiAgfTtcblxuICBwcml2YXRlIGRlcml2ZUFkZHJlc3MoXG4gICAgZGVyaXZlVHlwZTogJ3JlY2VpdmUnIHwgJ2NoYW5nZScsXG4gICAgaW5kZXg6IG51bWJlclxuICApOiB7IGFkZHJlc3M6IHN0cmluZzsgcHJpdmF0ZUtleTogYml0Y29yZS5Qcml2YXRlS2V5IH0ge1xuICAgIGNvbnN0IGRUeXBlID0gZGVyaXZlVHlwZSA9PT0gJ3JlY2VpdmUnID8gMCA6IDE7XG4gICAgY29uc3QgeyBwcml2YXRlS2V5IH0gPSB0aGlzLkhEV2FsbGV0LmRlcml2ZUNoaWxkKGBtLzQ0Jy85NzIvMCcvJHtkVHlwZX0nLyR7aW5kZXh9J2ApO1xuICAgIHJldHVybiB7XG4gICAgICBhZGRyZXNzOiBwcml2YXRlS2V5LnRvQWRkcmVzcyh0aGlzLm5ldHdvcmspLnRvU3RyaW5nKCksXG4gICAgICBwcml2YXRlS2V5LFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogRGVyaXZlcyBuIGFkZHJlc3NlcyBhbmQgYWRkcyB0aGVpciBrZXlwYWlycyB0byB0aGVpciBkZXJpdmVUeXBlLXJlc3BlY3RpdmUgYWRkcmVzcyBvYmplY3RcbiAgICogQHBhcmFtIG4gSG93IG1hbnkgYWRkcmVzc2VzIHRvIGRlcml2ZVxuICAgKiBAcGFyYW0gZGVyaXZlVHlwZSByZWNlaXZlIG9yIGNoYW5nZSBhZGRyZXNzXG4gICAqIEBwYXJhbSBvZmZzZXQgSW5kZXggdG8gc3RhcnQgYXQgaW4gZGVyaXZlIHBhdGhcbiAgICovXG4gIGdldEFkZHJlc3NlcyhuOiBudW1iZXIsIGRlcml2ZVR5cGU6ICdyZWNlaXZlJyB8ICdjaGFuZ2UnLCBvZmZzZXQgPSAwKSB7XG4gICAgcmV0dXJuIFsuLi5BcnJheShuKS5rZXlzKCldLm1hcCgoaSkgPT4ge1xuICAgICAgY29uc3QgaW5kZXggPSBpICsgb2Zmc2V0O1xuICAgICAgY29uc3QgeyBhZGRyZXNzLCBwcml2YXRlS2V5IH0gPSB0aGlzLmRlcml2ZUFkZHJlc3MoZGVyaXZlVHlwZSwgaW5kZXgpO1xuICAgICAgaWYgKGRlcml2ZVR5cGUgPT09ICdyZWNlaXZlJykge1xuICAgICAgICB0aGlzLnJlY2VpdmVBZGRyZXNzLmF0SW5kZXhbaW5kZXhdID0gYWRkcmVzcztcbiAgICAgICAgdGhpcy5yZWNlaXZlQWRkcmVzcy5rZXlwYWlyc1thZGRyZXNzXSA9IHByaXZhdGVLZXk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNoYW5nZUFkZHJlc3MuYXRJbmRleFtpbmRleF0gPSBhZGRyZXNzO1xuICAgICAgICB0aGlzLmNoYW5nZUFkZHJlc3Mua2V5cGFpcnNbYWRkcmVzc10gPSBwcml2YXRlS2V5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaW5kZXgsXG4gICAgICAgIGFkZHJlc3MsXG4gICAgICAgIHByaXZhdGVLZXksXG4gICAgICB9O1xuICAgIH0pO1xuICB9XG59XG4iXX0=