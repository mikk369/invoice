import React, { useState } from 'react';
import './index.css';

const InvoiceForm = () => {
    const [formData, setFormData] = useState({
        invoiceNumber: '',
        referenceNumber: '',
        invoiceDate: '',
        dueDate: '',
        deliveryDate: '',
        deliveryMethod: 'Pakirobot',
        issuer: 'Ettevõte OÜ',
        regNumber: '12345678',
        vatNumber: 'EE123456789',
        issuerContact: 'Lossi plats 1a, 10137 Tallinn, www.ettevote.ee, info@ettevote.ee',
        receiverName: '',
        receiverAddress: '',
        additionalInfo: 'Tasumisel palume maksekorraldusele kindlasti märkida viitenumber',
        items: [{ description: '', unitPrice: 0, quantity: 0, vat: 22 }],
        totalExclVat: 0,
        totalVat: 0,
        totalInclVat: 0
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const items = [...formData.items];
        items[index][name] = value;
        setFormData({ ...formData, items });
    };

    const addItem = () => {
        setFormData({ ...formData, items: [...formData.items, { description: '', unitPrice: 0, quantity: 0, vat: 22 }] });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const response = await fetch('https://www.invoice.webcodes.ee/create-pdf', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
      });
  
      if (response.ok) {
          window.open('https://www.invoice.webcodes.ee/invoice.pdf');
      } else {
          console.error('Failed to create PDF');
      }
  };
  

    return (
        <form onSubmit={handleSubmit} className="invoice-form">
            <h1>Arve</h1>
            <div className="form-group">
                <label>Arve number
                    <span className='has-text-danger'>*</span>
                </label>
                <input type="text" name="invoiceNumber" placeholder='120123456789' value={formData.invoiceNumber} onChange={handleInputChange} required />
                <label>Viitenumber</label>
                <input type="text" name="referenceNumber" placeholder='12345' value={formData.referenceNumber} onChange={handleInputChange} />
            </div>
            <div className="form-group">
                <label>Arve kuupäev*
                    <span className='has-text-danger'>*</span>
                </label>
                <input type="date" name="invoiceDate" value={formData.invoiceDate} onChange={handleInputChange} required />
                <label>Maksähtäeg</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} />
                <label>Tarneähtäeg</label>
                <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleInputChange} />
            </div>
            <div className="form-group">
                <label>Kättetoimetamise viis</label>
                <input type="text" name="deliveryMethod" value={formData.deliveryMethod} onChange={handleInputChange} />
            </div>
            <div className="form-group">
                <label>Arve esitaja*</label>
                <input type="text" name="issuer" value={formData.issuer} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
                <label>Registreerimisnumber*</label>
                <input type="text" name="regNumber" value={formData.regNumber} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
                <label>KMKR*</label>
                <input type="text" name="vatNumber" value={formData.vatNumber} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
                <label>Ettevõtte kontakt</label>
                <textarea name="issuerContact" value={formData.issuerContact} onChange={handleInputChange}></textarea>
            </div>
            <div className="form-group">
                <label>Arve saaja</label>
                <input type="text" name="receiverName" value={formData.receiverName} onChange={handleInputChange} />
                <input type="text" name="receiverAddress" value={formData.receiverAddress} onChange={handleInputChange} />
            </div>
            <div className="form-group">
                <label>Arve lisainfo</label>
                <textarea name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange}></textarea>
            </div>
            <div className="form-group">
                <label>Tooted ja teenused</label>
                {formData.items.map((item, index) => (
                    <div key={index} className="item-group">
                        <input type="text" name="description" placeholder="Kirjeldus" value={item.description} onChange={(e) => handleItemChange(index, e)} />
                        <input type="number" name="unitPrice" placeholder="Ühiku hind €" value={item.unitPrice} onChange={(e) => handleItemChange(index, e)} />
                        <input type="number" name="quantity" placeholder="Kogus" value={item.quantity} onChange={(e) => handleItemChange(index, e)} />
                        <input type="number" name="vat" placeholder="KM %" value={item.vat} onChange={(e) => handleItemChange(index, e)} />
                    </div>
                ))}
                <button type="button" onClick={addItem}>Lisa</button>
            </div>
            <div className="form-totals">
                <p>Summa km-ta: {formData.totalExclVat} €</p>
                <p>Käibemaks kokku: {formData.totalVat} €</p>
                <p>Arve summa: {formData.totalInclVat} €</p>
            </div>
            <button type="submit">Lae alla</button>
        </form>
    );
};

export default InvoiceForm;
